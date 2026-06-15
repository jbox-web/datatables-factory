# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Filters datatable', type: :system, js: true do
  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@filters.com', role: :admin,     age: 30, created_at: 1.month.ago)
    User.create!(first_name: 'Bob',   last_name: 'Jones', email: 'bob@filters.com',   role: :user,      age: 25, created_at: 6.months.ago)
    User.create!(first_name: 'Carol', last_name: 'Lee',   email: 'carol@filters.com', role: :moderator, age: 40, created_at: 2.months.ago)
  end

  it 'shows the table with rows' do
    visit '/filters'
    expect(page).to have_css('#filters-datatable_wrapper', wait: 5)
    expect(page).to have_css('tbody tr', minimum: 3, wait: 5)
  end

  it 'shows the filter containers' do
    visit '/filters'
    expect(page).to have_css('#filters-datatable_wrapper', wait: 5)
    # The JS filter system creates inputs inside the container divs
    expect(page).to have_css('[id$="-filter"]', wait: 3)
  end
end
