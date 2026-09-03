# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Context menu datatable', :js do
  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@ctx.com', role: :admin, age: 30)
  end

  it 'shows the table' do
    visit '/context_menu'
    expect(page).to have_css('#context_menu-datatable_wrapper', wait: 5)
    expect(wait_for_rows('#context_menu-datatable', count: 1)).to eq(1)
  end

  it 'marks rows with has-context-menu class' do
    visit '/context_menu'
    wait_for_rows('#context_menu-datatable', count: 1)

    expect(page).to have_css('#context_menu-datatable tbody tr.has-context-menu', wait: 5)
  end
end
