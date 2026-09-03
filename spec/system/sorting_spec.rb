# frozen_string_literal: true

require 'rails_helper'

# Sorting is server-side: clicking a header must round-trip through the ajax
# endpoint and reorder the whole dataset, not just the rows already on screen.
RSpec.describe 'Column sorting', :js do
  # 15 rows so the default 10-row page does not contain the whole dataset:
  # a sort that only reordered the visible page would not surface User14.
  before do
    15.times do |i|
      User.create!(
        first_name: format('User%02d', i),
        last_name:  format('Last%02d', 14 - i),
        email:      "u#{i}@sort.com",
        role:       :user,
        age:        20 + i
      )
    end
  end

  # Named, like every selector below: an unscoped 'tbody tr' both races the
  # redraw a sort triggers and matches any other table the page carries.
  def first_row
    find('#buttons-datatable tbody tr:first-child').text
  end

  describe 'declared default order' do
    it 'applies order: [[0, "asc"]] on load' do
      visit '/buttons'
      wait_for_datatable
      expect(wait_for_rows('#buttons-datatable', count: 10)).to eq(10)
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)
    end

    it 'applies order: [[1, "asc"]] on a table declaring another column' do
      visit '/basic'
      wait_for_rows('#basic-datatable', count: 10)

      # last_name ascending -> Last00, which belongs to User14
      expect(page).to have_css('#basic-datatable tbody tr:first-child', text: 'Last00', wait: 5)
    end
  end

  describe 'clicking a sortable header' do
    it 'sorts ascending on the first click' do
      visit '/buttons'
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)

      find('#buttons-datatable thead th', text: 'Last name').click
      wait_for_datatable

      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'Last00', wait: 5)
    end

    it 'reverses the order on the second click' do
      visit '/buttons'
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)

      find('#buttons-datatable thead th', text: 'Last name').click
      wait_for_datatable
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'Last00', wait: 5)

      find('#buttons-datatable thead th', text: 'Last name').click
      wait_for_datatable

      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'Last14', wait: 5)
    end

    it 'sorts across the whole dataset, not just the visible page' do
      visit '/buttons'
      wait_for_datatable
      expect(wait_for_rows('#buttons-datatable', count: 10)).to eq(10)
      # User14 carries the highest age and is not on the first page initially
      expect(page).to have_no_css('#buttons-datatable tbody tr', text: 'User14')

      find('#buttons-datatable thead th', text: 'Age').click
      wait_for_datatable
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)

      find('#buttons-datatable thead th', text: 'Age').click
      wait_for_datatable

      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User14', wait: 5)
    end
  end

  describe 'a column declared sortable: false' do
    it 'does not reorder the table when its header is clicked' do
      visit '/buttons'
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)

      before_click = first_row
      find('#buttons-datatable thead th', text: 'Role').click
      wait_for_datatable

      expect(first_row).to eq(before_click)
    end

    it 'keeps the other headers sortable' do
      visit '/buttons'
      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'User00', wait: 5)

      find('#buttons-datatable thead th', text: 'Role').click
      wait_for_datatable
      find('#buttons-datatable thead th', text: 'Last name').click
      wait_for_datatable

      expect(page).to have_css('#buttons-datatable tbody tr:first-child', text: 'Last00', wait: 5)
    end
  end
end
