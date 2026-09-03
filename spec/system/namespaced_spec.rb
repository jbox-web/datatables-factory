# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Namespaced datatable', :js do
  before do
    User.create!(first_name: 'Alice', last_name: 'Smith', email: 'alice@ns.com', role: :admin, age: 30)
    User.create!(first_name: 'Bob',   last_name: 'Jones', email: 'bob@ns.com',   role: :user,  age: 25)
  end

  it 'loads the table with the namespaced JS class' do
    visit '/namespaced'
    expect(page).to have_css('#acme-namespaced-datatable_wrapper', wait: 5)
    expect(wait_for_rows('#acme-namespaced-datatable', count: 2)).to eq(2)
  end

  it 'renders the correct table id' do
    visit '/namespaced'
    expect(page).to have_css('#acme-namespaced-datatable', wait: 3)
  end
end
