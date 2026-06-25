# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Context menu datatable', :js do
  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@ctx.com', role: :admin, age: 30)
  end

  it 'shows the table' do
    visit '/context_menu'
    expect(page).to have_css('#context_menu-datatable_wrapper', wait: 5)
    expect(page).to have_css('tbody tr', minimum: 1, wait: 5)
  end

  it 'marks rows with has-context-menu class' do
    visit '/context_menu'
    expect(page).to have_css('tbody tr', minimum: 1, wait: 5)
    expect(page).to have_css('tbody tr.has-context-menu', wait: 5)
  end
end
