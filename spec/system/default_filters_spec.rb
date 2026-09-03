# frozen_string_literal: true

require 'rails_helper'

# `populate_with` and the `apply_default_filters` button, which the dummy did
# not exercise at all. The host application uses them on the screens where a
# table opens already scoped — a campaign's targets, an account's campings — and
# its own specs record that the defaults are applied on preInit.dt.
#
# Both shapes are covered here because both exist there: a scalar for a text
# filter, an Array for a multi_select (whose values travel joined by '|').
RSpec.describe 'Default filters', :js do
  before do
    %i[user admin moderator].each_with_index do |role, i|
      User.create!(
        first_name: format('User%02d', i),
        last_name:  format('Last%02d', i),
        email:      "u#{i}@defaults.com",
        role:       role,
        age:        40 + i
      )
    end

    visit '/defaults'
  end

  # The table must never be seen unfiltered: _apply_filters runs at preInit, so
  # the very first request already carries the defaults.
  it 'opens already narrowed by the declared defaults' do
    expect(wait_for_rows('#defaults-datatable', count: 1)).to eq(1)
    expect(page).to have_css('#defaults-datatable tbody', text: 'User01')
  end

  it 'shows the scalar default in the text input' do
    wait_for_rows('#defaults-datatable', count: 1)

    expect(page).to have_field('dtf-filter-defaults-datatable-0', with: 'User01')
  end

  it 'shows the array default in the multi_select' do
    wait_for_rows('#defaults-datatable', count: 1)

    expect(page).to have_css('.ts-wrapper .item', count: 2, wait: 5)
  end

  it 'widens back to everything once the filters are reset' do
    wait_for_rows('#defaults-datatable', count: 1)

    find('.dt-buttons button[title="Reset all filters"]').click

    expect(wait_for_rows('#defaults-datatable', count: 3)).to eq(3)
  end

  it 'narrows again when the defaults are re-applied' do
    wait_for_rows('#defaults-datatable', count: 1)
    find('.dt-buttons button[title="Reset all filters"]').click
    wait_for_rows('#defaults-datatable', count: 3)

    find('.dt-buttons button[title="Apply default filters"]').click

    expect(wait_for_rows('#defaults-datatable', count: 1)).to eq(1)
  end
end
