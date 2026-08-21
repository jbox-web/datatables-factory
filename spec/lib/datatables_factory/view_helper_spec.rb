# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DatatablesFactory::ViewHelper do
  let(:view) { ActionView::Base.empty }

  describe 'shipped translations' do
    let(:gem_root) { File.expand_path('../../..', __dir__) }

    it 'registers its own locale file in the I18n load path' do
      engine_locales = I18n.load_path.select { |p| p.start_with?(File.join(gem_root, 'config/locales')) }
      expect(engine_locales).to_not be_empty
    end

    it 'translates every DataTables language key without a missing marker' do
      missing = view.datatables_translations.to_s.scan(/translation missing[^"]*/i)
      expect(missing).to be_empty
    end

    it 'provides the select-all button title' do
      expect(I18n.t('button.check_all')).to_not match(/translation missing/i)
    end

    it 'provides the unselect-all button title' do
      expect(I18n.t('button.uncheck_all')).to_not match(/translation missing/i)
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
      expect(view.label_filter_by('shipping_address')).to_not match(/translation missing/i)
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

  describe '#datatable_options_for_range_date' do
    it 'defaults to jQuery UI, with its own date format' do
      options = view.datatable_options_for_range_date

      expect(options[:filter_plugin]).to eq('jquery-ui')
      expect(options[:filter_plugin_options][:dateFormat]).to eq('dd/mm/yy')
    end

    # The two formats render the same string — 21/08/2026 — but they are spelled
    # differently: jQuery UI reads yy as the four-digit year, flatpickr as Y.
    # Handing one plugin the other's spelling silently changes what gets written
    # into the saved filter state.
    it 'switches to flatpickr and its spelling on request' do
      options = view.datatable_options_for_range_date(plugin: 'flatpickr')

      expect(options[:filter_plugin]).to eq('flatpickr')
      expect(options[:filter_plugin_options][:dateFormat]).to eq('d/m/Y')
    end

    it 'keeps the two placeholders whichever plugin is used' do
      options = view.datatable_options_for_range_date(plugin: 'flatpickr')

      expect(options[:filter_default_label].size).to eq(2)
      expect(options[:filter_default_label]).to_not include(a_string_matching(/translation missing/i))
    end

    # The options hash used to be handed out straight from the frozen constant:
    # freeze only covers the outer hash, so a caller adjusting the format — the
    # views already call .merge on the result, which copies the top level only —
    # corrupted every later call in the same process.
    it 'hands out a fresh options hash on every call' do
      first = view.datatable_options_for_range_date(plugin: 'flatpickr')
      first[:filter_plugin_options][:dateFormat] = 'mutated'

      second = view.datatable_options_for_range_date(plugin: 'flatpickr')

      expect(second[:filter_plugin_options][:dateFormat]).to eq('d/m/Y')
    end

    it 'drops the jQuery UI only options when flatpickr is selected' do
      options = view.datatable_options_for_range_date(plugin: 'flatpickr')

      expect(options[:filter_plugin_options]).to_not include(:changeMonth)
      expect(options[:filter_plugin_options]).to_not include(:changeYear)
    end
  end

  describe '#datatable_dom_with_selected' do
    it 'builds the DataTables dom string' do
      expect(view.datatable_dom_with_selected('x')).to include('selected-count')
    end
  end
end
