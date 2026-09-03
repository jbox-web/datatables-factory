# frozen_string_literal: true

require 'rails_helper'

# Two tables on one page, the first one deliberately broken. No page in the
# dummy had more than one table, so nothing ever exercised what
# Loader.load_datatables does when one entry fails: it iterates with $.each and
# no isolation, so the exception leaves the loop and the tables after it are
# never initialised — along with the rest of the host's turbo:load chain.
#
# The broken element is a bare <table data-toggle="datatable"> with no
# data-dtf-loader attribute, which is what a stray copy-paste or a partial
# rendered outside its helper produces.
RSpec.describe 'Several datatables on one page', :js do
  # js_errors is on for the whole suite, and rightly so — but here the uncaught
  # TypeError IS the subject, and Cuprite would raise it out of `visit` before
  # any assertion could observe what it costs. Its own driver name, not :cuprite
  # with tweaked options: see spec/support/capybara.rb.
  before do
    driven_by :cuprite_tolerating_js_errors,
              screen_size: CUPRITE_DRIVER_OPTIONS[:window_size],
              options:     CUPRITE_DRIVER_OPTIONS.deep_dup.merge(js_errors: false)

    3.times do |i|
      User.create!(
        first_name: format('User%02d', i),
        last_name:  format('Last%02d', i),
        email:      "u#{i}@multi.com",
        role:       :user,
        age:        50 + i
      )
    end

    visit '/multi'
  end

  it 'renders both tagged elements' do
    expect(page).to have_css('[data-toggle=datatable]', count: 2, visible: :all)
  end

  it 'reports the broken one' do
    expect(page).to have_css('#broken-datatable', visible: :all)
    expect(page).to have_no_css('#broken-datatable_wrapper')
  end

  # COR-loader.coffee:65 — the throw raised on the first element aborts $.each,
  # so the healthy table below it never gets initialised.
  it 'still loads the healthy table declared after it' do
    pending 'COR-loader.coffee:65 — a throw on one element aborts load_datatables for every later one'

    expect(wait_for_rows('#basic-datatable', count: 3)).to eq(3)
  end
end
