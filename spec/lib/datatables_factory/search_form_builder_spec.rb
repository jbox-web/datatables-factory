# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DatatablesFactory::SearchFormBuilder do
  let(:view) { ActionView::Base.empty }
  let(:datatable) { DatatablesFactory::Presenter.new(view, :users) }
  let(:builder) { described_class.new('', nil, view, datatable: datatable) }

  before do
    datatable.head_for :first_name, label: 'First name'
    datatable.head_for :email,      label: 'Email'
  end

  def declared_filters
    datatable.send(:datatable_options)[:filters]
  end

  describe 'column resolution' do
    it 'resolves the column_id from the declared columns' do
      builder.text_field(:email, filter_default_label: 'Email')

      expect(declared_filters.last[:column_id]).to eq(1)
    end

    it 'raises when the filter targets a column that was never declared' do
      expect { builder.text_field(:emial, filter_default_label: 'Email') }
        .to raise_error(ArgumentError, /emial/)
    end

    it 'names the unknown column and lists the declared ones' do
      expect { builder.text_field(:emial, filter_default_label: 'Email') }
        .to raise_error(ArgumentError, /first_name/)
    end
  end

  describe 'filter types' do
    it 'tags a text field' do
      builder.text_field(:email, filter_default_label: 'Email')
      expect(declared_filters.last[:filter_type]).to eq('text')
    end

    it 'tags a number range' do
      builder.range(:email, filter_default_label: %w[Min Max])
      expect(declared_filters.last[:filter_type]).to eq('range_number')
    end

    it 'tags a date range' do
      builder.range_date(:email, filter_default_label: %w[From To])
      expect(declared_filters.last[:filter_type]).to eq('range_date')
    end

    it 'defaults a select to tom-select' do
      builder.select(:email, filter_default_label: 'Email')

      expect(declared_filters.last).to include(
        filter_type:   'select',
        filter_plugin: 'tom-select'
      )
    end

    it 'lets an explicit plugin win over the tom-select default' do
      builder.select(:email, filter_default_label: 'Email', filter_plugin: 'select2')
      expect(declared_filters.last[:filter_plugin]).to eq('select2')
    end
  end

  describe 'container' do
    it 'renders a container div carrying the generated id' do
      html = builder.text_field(:email, filter_default_label: 'Email')
      expect(html).to eq('<div id="users-email-filter"></div>')
    end

    it 'passes the container id to the filter' do
      builder.text_field(:email, filter_default_label: 'Email')
      expect(declared_filters.last[:filter_container_id]).to eq('users-email-filter')
    end
  end
end
