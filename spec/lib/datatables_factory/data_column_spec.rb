# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DatatablesFactory::DataColumn do
  let(:view) { ActionView::Base.empty }

  describe '#css_class' do
    it 'appends the column name and the colvis marker' do
      column = described_class.new(view, :email)
      expect(column.css_class).to eq('email colvis')
    end

    it 'omits the colvis marker when colvis is false' do
      column = described_class.new(view, :email, colvis: false)
      expect(column.css_class).to eq('email')
    end

    it 'accepts a String for the :class option' do
      column = described_class.new(view, :email, class: 'text-center')
      expect(column.css_class).to eq('text-center email colvis')
    end

    it 'accepts an Array for the :class option' do
      column = described_class.new(view, :email, class: %w[text-center fw-bold])
      expect(column.css_class).to eq('text-center fw-bold email colvis')
    end

    it 'returns the same value when called twice' do
      column = described_class.new(view, :email, class: ['text-center'])
      first  = column.css_class

      expect(column.css_class).to eq(first)
    end

    it 'does not mutate the options given by the caller' do
      opts = { class: ['text-center'] }
      described_class.new(view, :email, opts).css_class

      expect(opts).to eq({ class: ['text-center'] })
    end
  end

  describe '#to_hash' do
    it 'exposes the DataTables column configuration' do
      column = described_class.new(view, :email, label: 'Email', width: '10%')

      expect(column.to_hash).to eq(
        className:  'email colvis',
        visible:    true,
        orderable:  true,
        searchable: true,
        width:      '10%',
        data:       :email,
        name:       'Email'
      )
    end

    it 'names the check_box column Select All' do
      column = described_class.new(view, :check_box)
      expect(column.to_hash[:name]).to eq('Select All')
    end
  end

  describe '#to_s' do
    it 'renders a th carrying the css classes' do
      column = described_class.new(view, :email, label: 'Email')
      expect(column.to_s).to eq('<th class="email colvis">Email</th>')
    end
  end
end
