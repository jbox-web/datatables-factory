# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DatatablesFactory::ViewHelper do
  let(:view) { ActionView::Base.empty }

  describe 'shipped translations' do
    let(:gem_root) { File.expand_path('../../..', __dir__) }

    it 'registers its own locale file in the I18n load path' do
      engine_locales = I18n.load_path.select { |p| p.start_with?(File.join(gem_root, 'config/locales')) }
      expect(engine_locales).not_to be_empty
    end

    it 'translates every DataTables language key without a missing marker' do
      missing = view.datatables_translations.to_s.scan(/translation missing[^"]*/i)
      expect(missing).to be_empty
    end

    it 'provides the select-all button title' do
      expect(I18n.t('button.check_all')).not_to match(/translation missing/i)
    end

    it 'provides the unselect-all button title' do
      expect(I18n.t('button.uncheck_all')).not_to match(/translation missing/i)
    end
  end

  describe '#label_filter_by' do
    it 'uses the column translation when it exists' do
      expect(view.label_filter_by('email')).to eq('Filter by email')
    end

    it 'falls back to a humanized label for an untranslated column' do
      expect(view.label_filter_by('shipping_address')).to eq('Filter by shipping address')
    end

    it 'never renders a translation missing marker' do
      expect(view.label_filter_by('shipping_address')).not_to match(/translation missing/i)
    end

    it 'omits the prefix when asked' do
      expect(view.label_filter_by('shipping_address', prefix: false)).to eq('Shipping address')
    end
  end

  describe '#datatables_factory_options' do
    it 'forwards the Rails env to the JS side' do
      allow(view).to receive(:params).and_return({})
      expect(view.datatables_factory_options[:dtf_options][:env]).to eq('test')
    end
  end

  describe '#datatable_dom_with_selected' do
    it 'builds the DataTables dom string' do
      expect(view.datatable_dom_with_selected('x')).to include('selected-count')
    end
  end
end
