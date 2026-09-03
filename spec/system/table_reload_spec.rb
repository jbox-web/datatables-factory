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
    find('#basic-datatable tbody tr', match: :first, wait: 5)
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

  # Reloading in place on a page that HAS filters is the case the audit found
  # uncovered: /basic declares none, so the filter rebuild — the part that used
  # to stack a second widget set on the first — never ran here.
  context 'with filters declared on the page' do
    before do
      visit '/filters'
      wait_for_rows('#filters-datatable', count: 3)
      page.execute_script('window.DatatableBase.load_datatables()')
      wait_for_rows('#filters-datatable', count: 3)
    end

    it 'rebuilds each filter instead of adding to it' do
      wrappers = page.evaluate_script(
        "document.querySelectorAll('#filters-first-name-filter div.dtf-filter-wrapper').length"
      )
      inputs = page.evaluate_script(
        "document.querySelectorAll('#filters-first-name-filter input.dtf-filter').length"
      )

      expect(wrappers).to eq(1)
      expect(inputs).to eq(1)
    end

    it 'still filters from the rebuilt input' do
      fill_in 'dtf-filter-filters-datatable-0', with: 'User01'

      expect(wait_for_rows('#filters-datatable', count: 1)).to eq(1)
    end
  end

  it 'still sorts when a header is clicked' do
    expect(page).to have_css('#basic-datatable tbody tr:first-child', text: 'Last00', wait: 5)

    find('#basic-datatable thead th', text: 'First name').click
    wait_for_datatable

    expect(page).to have_css('#basic-datatable tbody tr:first-child', text: 'User00', wait: 5)
  end
end
