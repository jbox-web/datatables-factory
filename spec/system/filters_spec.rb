# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Filters datatable', :js do
  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@filters.com', role: :admin,     age: 30,
                 created_at: 1.month.ago)
    User.create!(first_name: 'Bob',   last_name: 'Jones', email: 'bob@filters.com',   role: :user,      age: 25,
                 created_at: 6.months.ago)
    User.create!(first_name: 'Carol', last_name: 'Lee',   email: 'carol@filters.com', role: :moderator, age: 40,
                 created_at: 2.months.ago)
  end

  it 'shows the table with rows' do
    visit '/filters'
    expect(page).to have_css('#filters-datatable_wrapper', wait: 5)
    expect(wait_for_rows('#filters-datatable', count: 3)).to eq(3)
  end

  it 'shows the filter containers' do
    visit '/filters'
    expect(page).to have_css('#filters-datatable_wrapper', wait: 5)
    # The JS filter system creates inputs inside the container divs
    expect(page).to have_css('[id$="-filter"]', wait: 3)
  end

  # These filters are debounced, so the redraw lands well after the keystroke —
  # right in the window a bare have_css polls. Counting through wait_for_rows
  # takes the count atomically instead of resolving node handles a draw can
  # detach under it.
  it 'filters rows through a column filter' do
    visit '/filters'
    wait_for_rows('#filters-datatable', count: 3)

    find('#filters-first-name-filter input.dtf-filter').set('Alice')

    expect(wait_for_rows('#filters-datatable', count: 1)).to eq(1)
    expect(page).to have_text('Alice')
  end

  # The reset button goes through DatatableFilter#_set_search_value, which pokes
  # the DataTables internal per-column search store. That store was renamed in
  # DataTables 3 (aoPreSearchCols -> searches), so this is the regression guard.
  it 'clears the column filters with the reset button' do
    visit '/filters'
    wait_for_rows('#filters-datatable', count: 3)

    find('#filters-first-name-filter input.dtf-filter').set('Alice')
    wait_for_rows('#filters-datatable', count: 1)

    find('#filters-datatable_wrapper button[title="Reset all filters"]').click

    expect(wait_for_rows('#filters-datatable', count: 3)).to eq(3)
    expect(find('#filters-first-name-filter input.dtf-filter').value).to eq('')
  end
end
