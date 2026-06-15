# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Basic datatable', type: :system, js: true do
  before do
    User.create!(first_name: 'Alice', last_name: 'Smith',  email: 'alice@example.com', role: :admin,     age: 30)
    User.create!(first_name: 'Bob',   last_name: 'Jones',  email: 'bob@example.com',   role: :user,      age: 25)
    User.create!(first_name: 'Carol', last_name: 'Taylor', email: 'carol@example.com', role: :moderator, age: 40)
  end

  it 'loads the table and displays rows' do
    visit '/basic'
    expect(page).to have_css('#basic-datatable_wrapper', wait: 5)
    expect(page).to have_css('tbody tr', minimum: 3, wait: 5)
  end

  it 'filters rows using the global search' do
    visit '/basic'
    expect(page).to have_css('tbody tr', minimum: 3, wait: 5)
    find('.dt-search input, input[type="search"]').set('Alice')
    expect(page).to have_css('tbody tr', count: 1, wait: 5)
    expect(page).to have_text('Alice')
  end

  it 'sorts by last name ascending by default' do
    visit '/basic'
    expect(page).to have_css('tbody tr', minimum: 3, wait: 5)
    # Default order is [[1, 'asc']] — last name ascending, so Jones < Smith < Taylor
    expect(page).to have_css('tbody tr:first-child td', text: 'Jones', wait: 5)
  end
end
