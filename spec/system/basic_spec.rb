# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Basic datatable', :js do
  before do
    User.create!(first_name: 'Alice', last_name: 'Smith',  email: 'alice@example.com', role: :admin,     age: 30)
    User.create!(first_name: 'Bob',   last_name: 'Jones',  email: 'bob@example.com',   role: :user,      age: 25)
    User.create!(first_name: 'Carol', last_name: 'Taylor', email: 'carol@example.com', role: :moderator, age: 40)
  end

  it 'loads the table and displays rows' do
    visit '/basic'
    expect(page).to have_css('#basic-datatable_wrapper', wait: 5)
    expect(wait_for_rows('#basic-datatable', count: 3)).to eq(3)
  end

  # Counted through wait_for_rows: the search redraws the table, and a bare
  # have_css resolves its selector into node handles before querying them, so a
  # draw landing in between makes Capybara raise on detached nodes.
  it 'filters rows using the global search' do
    visit '/basic'
    wait_for_rows('#basic-datatable', count: 3)

    find('#basic-datatable_wrapper .dt-search input, #basic-datatable_wrapper input[type="search"]').set('Alice')

    expect(wait_for_rows('#basic-datatable', count: 1)).to eq(1)
    expect(page).to have_text('Alice')
  end

  it 'sorts by last name ascending by default' do
    visit '/basic'
    wait_for_rows('#basic-datatable', count: 3)

    # Default order is [[1, 'asc']] — last name ascending, so Jones < Smith < Taylor
    expect(page).to have_css('#basic-datatable tbody tr:first-child td', text: 'Jones', wait: 5)
  end
end
