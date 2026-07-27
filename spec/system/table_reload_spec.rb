# frozen_string_literal: true

require 'rails_helper'

# Reloading a table in place (calling load_datatables again without navigating)
# reuses the very same <table> node, unlike a Turbo navigation which replaces it.
# Any listener the previous instance left on that node therefore survives the
# teardown and fires again on the next initialisation.
RSpec.describe 'Reloading a table in place', :js do
  before do
    3.times do |i|
      User.create!(
        first_name: format('User%02d', i),
        last_name:  format('Last%02d', 2 - i),
        email:      "u#{i}@reload.com",
        role:       :user,
        age:        20 + i
      )
    end

    visit '/basic'
    find('tbody tr', match: :first, wait: 5)
    page.execute_script('window.__dtf_previous = window.Datatables.BasicDatatable.instance')
    page.execute_script('window.DatatableBase.load_datatables()')
    find('#basic-datatable tbody tr', match: :first, wait: 5)
  end

  it 'leaves the previous instance destroyed' do
    expect(page.evaluate_script('window.__dtf_previous.datatable === null')).to be(true)
  end

  it 'installs a different instance' do
    same = page.evaluate_script('window.__dtf_previous === window.Datatables.BasicDatatable.instance')
    expect(same).to be(false)
  end

  it 'renders a single table' do
    expect(page).to have_css('#basic-datatable', count: 1)
  end

  it 'renders a single DataTables wrapper' do
    expect(page).to have_css('#basic-datatable_wrapper', count: 1)
  end

  it 'still displays its rows' do
    expect(page).to have_css('#basic-datatable tbody tr', count: 3, wait: 5)
  end

  it 'still sorts when a header is clicked' do
    expect(page).to have_css('tbody tr:first-child', text: 'Last00', wait: 5)

    find('thead th', text: 'First name').click

    expect(page).to have_css('tbody tr:first-child', text: 'User00', wait: 5)
  end
end
