# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Buttons datatable', :js do
  before do
    3.times do |i|
      User.create!(first_name: "User#{i}", last_name: "Last#{i}", email: "user#{i}@btn.com", role: :user, age: 20 + i)
    end
  end

  it 'renders the table' do
    visit '/buttons'
    expect(page).to have_css('#buttons-datatable_wrapper', wait: 5)
    expect(page).to have_css('tbody tr', minimum: 3, wait: 5)
  end

  it 'has the DataTables buttons toolbar' do
    visit '/buttons'
    expect(page).to have_css('#buttons-datatable_wrapper', wait: 5)
    expect(page).to have_css('.dt-buttons', wait: 5)
  end
end
