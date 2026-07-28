# frozen_string_literal: true

require 'rails_helper'

# Filters carried by the query string (?dt_filters[column]=value) are seeded into
# the filter state before the filters are built, so the very first draw is
# already filtered and every widget shows its value.
RSpec.describe 'Filters pre-applied from the URL', :js do
  let(:table) { '#filters-datatable' }

  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@filters.com', role: :admin,     age: 30,
                 created_at: 1.month.ago)
    User.create!(first_name: 'Bob',   last_name: 'Jones', email: 'bob@filters.com',   role: :user,      age: 25,
                 created_at: 6.months.ago)
    User.create!(first_name: 'Carol', last_name: 'Lee',   email: 'carol@filters.com', role: :moderator, age: 40,
                 created_at: 2.months.ago)
  end

  describe 'text filter' do
    it 'filters the rows on the first draw' do
      visit '/filters?dt_filters[first_name]=Alice'

      expect(page).to have_css("#{table}_wrapper", wait: 5)
      wait_for_rows(table, count: 1)
      expect(page).to have_text('Alice')
    end

    it 'pre-fills the search form field' do
      visit '/filters?dt_filters[first_name]=Alice'

      wait_for_rows(table, count: 1)
      expect(find('#filters-first-name-filter input.yadcf-filter').value).to eq('Alice')
    end
  end

  describe 'select filter' do
    it 'filters the rows on the first draw' do
      visit '/filters?dt_filters[role]=admin'

      expect(page).to have_css("#{table}_wrapper", wait: 5)
      wait_for_rows(table, count: 1)
      expect(page).to have_text('Alice')
    end

    # The dropdown is only populated by the first xhr, so the value can only show
    # up once the filter has reloaded its options and restored its state again.
    it 'shows the selected option in the search form' do
      visit '/filters?dt_filters[role]=admin'

      wait_for_rows(table, count: 1)
      expect(page).to have_css('#filters-role-filter .ts-control .item', text: 'Admin', wait: 5)
    end
  end

  describe 'range filter' do
    it 'filters the rows with both bounds' do
      visit '/filters?dt_filters[age][from]=26&dt_filters[age][to]=45'

      expect(page).to have_css("#{table}_wrapper", wait: 5)
      # Alice (30) and Carol (40); Bob (25) is out.
      wait_for_rows(table, count: 2)
      expect(page).to have_no_text('Bob')
    end

    it 'pre-fills both bounds in the search form' do
      visit '/filters?dt_filters[age][from]=26&dt_filters[age][to]=45'

      wait_for_rows(table, count: 2)
      expect(find('#filters-age-filter input.yadcf-filter-range-start').value).to eq('26')
      expect(find('#filters-age-filter input.yadcf-filter-range-end').value).to eq('45')
    end

    it 'accepts the delimited form the server itself uses' do
      visit '/filters?dt_filters[age]=26-yadcf_delim-45'

      expect(page).to have_css("#{table}_wrapper", wait: 5)
      wait_for_rows(table, count: 2)
      expect(find('#filters-age-filter input.yadcf-filter-range-start').value).to eq('26')
    end
  end

  # A state saved from an earlier visit would otherwise silently discard the
  # filters of the link the user just followed.
  it 'wins over the state saved by DataTables' do
    visit '/filters'
    wait_for_rows(table, count: 3)
    find('#filters-first-name-filter input.yadcf-filter').set('Bob')
    wait_for_rows(table, count: 1)

    visit '/filters?dt_filters[first_name]=Alice'

    wait_for_rows(table, count: 1)
    expect(find('#filters-first-name-filter input.yadcf-filter').value).to eq('Alice')
    expect(page).to have_text('Alice')
  end

  it 'ignores a column that carries no filter' do
    visit '/filters?dt_filters[unknown_column]=x'

    expect(page).to have_css("#{table}_wrapper", wait: 5)
    wait_for_rows(table, count: 3)
  end

  # The saved state restores the page the user left the table on. A filtered set
  # is shorter, so that page is usually out of range: the request goes out with
  # its offset, the server has nothing that far, and the link lands on an empty
  # table announcing "showing 11 to 2 of 2".
  it 'starts back at the first page' do
    12.times do |i|
      User.create!(first_name: "Filler#{i}", last_name: "Zz#{i}", email: "filler#{i}@filters.com", role: :user, age: 20)
    end

    visit '/filters'
    wait_for_rows(table, count: 10)

    page.execute_script("window.jQuery('#{table}').DataTable().page(1).draw('page')")
    wait_for_rows(table, count: 5)

    visit '/filters?dt_filters[role]=admin'

    wait_for_rows(table, count: 1)
    expect(page).to have_text('Alice')
  end
end
