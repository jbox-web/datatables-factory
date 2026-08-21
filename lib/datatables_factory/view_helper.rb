# frozen_string_literal: true

module DatatablesFactory
  module ViewHelper

    def datatable_dom_with_selected_and_buttons(css_class = nil)
      "<\"html5buttons\"B>#{datatable_dom_with_selected(css_class)}"
    end


    def datatable_dom_with_selected(css_class = nil)
      "lr<\"clearfix\"><\"dataTables_info selected-count-wrapper #{css_class}\"<\".selected-count\">><\"#{css_class}\" i>tp"
    end


    def datatables_for(id, opts: {}, html_opts: {})
      datatable = Presenter.new(self, id, opts: opts, html_opts: html_opts)
      yield datatable if block_given?
      datatable
    end


    def bootstrap_datatables_for(name, opts = {}, &block)
      css_opts  = { width: '100%', class: 'table table-striped dt-responsive align-middle w-100' }
      html_opts = opts.delete(:html_opts) { {} }
      html_opts = html_opts.merge(css_opts)
      opts      = opts.deep_merge(datatables_factory_options)
      datatables_for(name, opts: opts, html_opts: html_opts, &block)
    end


    def datatables_factory_options
      debug_log  = params.fetch(:dtf_debug_log, false)
      debug_dump = params.fetch(:dtf_debug_dump, false)
      { dtf_options: { env: Rails.env, debug_log: debug_log, debug_dump: debug_dump } }
    end


    # Date pickers the host application already ships. Both formats render the
    # same string (21/08/2026), but each library spells it its own way — jQuery
    # UI reads `yy` as the four-digit year where flatpickr reads `Y`. Handing one
    # the other's spelling silently changes what lands in the saved filter state.
    RANGE_DATE_PLUGINS = {
      'jquery-ui' => { changeMonth: true, changeYear: true, dateFormat: 'dd/mm/yy' },
      'flatpickr' => { dateFormat: 'd/m/Y' },
    }.freeze

    def datatable_options_for_range_date(plugin: 'jquery-ui')
      options = RANGE_DATE_PLUGINS.fetch(plugin) { raise ArgumentError, "Unknown date picker: #{plugin}" }

      {
        filter_default_label:  [label_filter_by('date_start', prefix: false), label_filter_by('date_end', prefix: false)],
        filter_plugin:         plugin,
        # dup, because freeze only covers the outer hash: handing the inner one
        # out shares it with every later call, and callers do adjust it — the
        # views merge onto the result, which copies the top level only.
        filter_plugin_options: options.dup,
      }
    end


    # Per-column labels live in the host application. Fall back to the humanized
    # column name rather than rendering an I18n "translation missing" marker
    # into the filter placeholder.
    def label_filter_by(label, prefix: true)
      label  = t("datatables.filter.#{label}", default: label.to_s.humanize)
      label  = label.downcase if prefix
      prefix = prefix ? "#{t('text.filter_by')} " : ''
      "#{prefix}#{label}"
    end


    # rubocop:disable Metrics/MethodLength, Metrics/AbcSize
    def datatables_translations
      {
        processing:     t('datatables.processing'),
        search:         t('datatables.search'),
        lengthMenu:     t('datatables.lengthMenu'),
        info:           t('datatables.info'),
        infoEmpty:      t('datatables.infoEmpty'),
        infoFiltered:   t('datatables.infoFiltered'),
        infoPostFix:    t('datatables.infoPostFix'),
        loadingRecords: t('datatables.loadingRecords'),
        zeroRecords:    t('datatables.zeroRecords'),
        emptyTable:     t('datatables.emptyTable'),
        paginate:       {
          first:    t('datatables.paginate.first'),
          previous: t('datatables.paginate.previous'),
          next:     t('datatables.paginate.next'),
          last:     t('datatables.paginate.last'),
        },
        aria:           {
          sortAscending:  t('datatables.aria.sortAscending'),
          sortDescending: t('datatables.aria.sortDescending'),
        },
        select:         {
          rows: t('datatables.select.rows'),
        },
        buttons:        {
          pageLength:    {
            _:    t('datatables.buttons.pageLength._'),
            '-1': t('datatables.buttons.pageLength.-1'),
          },
          colvisRestore: t('datatables.buttons.colvisRestore'),
        },
      }
    end
    # rubocop:enable Metrics/MethodLength, Metrics/AbcSize

  end
end
