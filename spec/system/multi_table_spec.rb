# frozen_string_literal: true

require 'rails_helper'

# Two tables on one page, the first one deliberately broken. No page in the
# dummy had more than one table, so nothing ever exercised what
# Loader.load_datatables does when one entry fails — and it used to lose every
# table after it, along with the rest of the host's turbo:load chain.
#
# The broken element is a bare <table data-toggle="datatable"> with no
# data-dtf-loader attribute, which is what a stray copy-paste or a partial
# rendered outside its helper produces.
RSpec.describe 'Several datatables on one page', :js do
  # Deliberately on the shared driver, js_errors on: load_datatables now catches
  # per element, so the malformed one must not let anything escape. If this file
  # ever starts raising Ferrum::JavaScriptError again, the isolation is gone.
  before do
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

  # The point of the page: the malformed element is reported and stepped over.
  it 'still loads the healthy table declared after it' do
    expect(wait_for_rows('#basic-datatable', count: 3)).to eq(3)
  end
end
