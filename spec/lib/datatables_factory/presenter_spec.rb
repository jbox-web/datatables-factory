# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DatatablesFactory::Presenter do
  let(:view) { ActionView::Base.empty }

  def presenter(id = :users, opts: {}, html_opts: {})
    described_class.new(view, id, opts: opts, html_opts: html_opts)
  end

  def options_for(table)
    table.send(:build_datatable_options)[:data][:dtf_loader]
  end

  describe 'caller-supplied options' do
    it 'does not mutate the opts hash given by the caller' do
      opts = { source: '/users', dtf_options: { env: 'test' }, namespace: [:billing] }
      presenter(opts: opts)

      expect(opts).to eq({ source: '/users', dtf_options: { env: 'test' }, namespace: [:billing] })
    end

    it 'does not mutate the namespace array given by the caller' do
      namespace = [:billing]
      dt = presenter(:invoices, opts: { namespace: namespace })
      options_for(dt)

      expect(namespace).to eq([:billing])
    end

    it 'resolves the same JS class when the namespace array is reused' do
      namespace = [:billing]
      first  = options_for(presenter(:invoices, opts: { namespace: namespace }))
      second = options_for(presenter(:invoices, opts: { namespace: namespace }))

      expect(second[:dt_class]).to eq(first[:dt_class])
    end

    it 'builds the namespaced JS class path' do
      dt = presenter(:invoices, opts: { namespace: [:billing] })
      expect(options_for(dt)[:dt_class]).to eq('Datatables.Billing.InvoicesDatatable')
    end

    it 'honours a custom js_namespace' do
      dt = presenter(:invoices, opts: { js_namespace: 'MyApp' })
      expect(options_for(dt)[:dt_class]).to eq('MyApp.Datatables.InvoicesDatatable')
    end
  end

  describe 'option precedence' do
    it 'keeps the columns built by the DSL over a stray :columns option' do
      dt = presenter(opts: { columns: ['bogus'] })
      dt.head_for :email, label: 'Email'

      expect(options_for(dt)[:dt_options][:columns].map { |c| c[:data] }).to eq([:email])
    end

    it 'keeps the filters built by the DSL over a stray :filters option' do
      dt = presenter(opts: { filters: ['bogus'] })
      dt.search_field(column_id: 0, filter_type: 'text')

      expect(options_for(dt)[:dt_options][:filters]).to eq([{ column_id: 0, filter_type: 'text' }])
    end

    it 'still forwards unrelated DataTables options' do
      dt = presenter(opts: { source: '/users', serverSide: true })
      expect(options_for(dt)[:dt_options]).to include(source: '/users', serverSide: true)
    end
  end

  describe 'identifiers' do
    it 'builds the dom id from the namespace and the table id' do
      dt = presenter(:invoices, opts: { namespace: [:billing] })
      expect(dt.send(:build_datatable_options)[:id]).to eq('billing-invoices-datatable')
    end

    it 'points dt_id at the dom id' do
      dt = presenter(:invoices)
      expect(options_for(dt)[:dt_id]).to eq('#invoices-datatable')
    end
  end

  describe '#body' do
    it 'enables the context menu when the body carries the context-menu class' do
      dt = presenter
      dt.body class: 'context-menu'

      expect(options_for(dt)[:dtf_options]).to include(context_menu: true)
    end

    it 'leaves the context menu off otherwise' do
      dt = presenter
      dt.body class: 'table-striped'

      expect(options_for(dt)[:dtf_options]).to_not include(context_menu: true)
    end
  end

  describe '#search_field' do
    it 'records a pre-populated filter as an applied filter' do
      dt = presenter
      dt.search_field(column_id: 2, filter_type: 'select', populate_with: 'admin')

      expect(options_for(dt)[:dt_options][:filters_applied]).to eq([{ column_id: 2, value: 'admin' }])
    end

    it 'strips populate_with from the filter itself' do
      dt = presenter
      dt.search_field(column_id: 2, filter_type: 'select', populate_with: 'admin')

      expect(options_for(dt)[:dt_options][:filters].last).to_not have_key(:populate_with)
    end
  end

  describe 'unknown methods' do
    it 'raises a NoMethodError naming the presenter for a mistyped DSL call' do
      expect { presenter.head_for_checkbox }
        .to raise_error(NoMethodError, /DatatablesFactory::Presenter/)
    end

    it 'still delegates genuine view helpers' do
      expect(presenter.tag.br).to eq('<br>')
    end
  end
end
