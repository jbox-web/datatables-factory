# frozen_string_literal: true

module DatatablesFactory
  class Presenter < SimpleDelegator

    attr_reader :dt_id, :dtf_options, :column_names

    # rubocop:disable Metrics/MethodLength
    def initialize(view, id, opts: {}, html_opts: {})
      super(view)
      @view            = view
      @opts            = opts
      @dtf_options     = opts.delete(:dtf_options) { {} }
      @namespace       = opts.delete(:namespace) { [] }
      @dt_id           = id
      @columns         = []
      @column_names    = []
      @buttons         = []
      @filters         = []
      @filters_applied = []
      @body_opts       = {}
      @html_opts       = html_opts
    end
    # rubocop:enable Metrics/MethodLength


    def head_for_check_box
      head_for :check_box, label: link_to_select_all(datatable_id), sortable: false, searchable: false, colvis: false
    end


    def head_for(column, opts = {})
      @column_names << column
      @columns << DataColumn.new(@view, column, opts)
    end


    def body(opts = {})
      @body_opts = opts
      @dtf_options.merge!(context_menu: true) if @body_opts.key?(:class) && @body_opts[:class].include?('context-menu')
    end


    def button(opts = {})
      @buttons << opts
    end


    def search_form(options = {}, &block)
      options.reverse_merge!({ builder: SearchFormBuilder })
      options[:html]             ||= {}
      options[:html][:role]      ||= 'form'
      options[:layout]           ||= :horizontal
      options[:acts_like_form_tag] =   true
      options[:datatable]          =   self

      layout = "form-#{options[:layout]}"
      options[:html][:class] = [options[:html][:class], layout].compact.join(' ')

      form_for('', options, &block)
    end


    def search_field(field)
      populate_with = field.delete(:populate_with)
      @filters_applied << { column_id: field[:column_id], value: populate_with } if populate_with
      @filters << field
    end


    def render_datatable
      options = @html_opts.deep_merge(build_datatable_options)
      tag.table(table_content, options)
    end


    private


      def build_datatable_options
        {
          id: datatable_id,
          data: {
            toggle: 'datatable',
            dtf_loader: {
              dt_id: "##{datatable_id}",
              dt_class: datatable_js_class,
              dt_options: datatable_options,
              dtf_options: dtf_options,
            },
          },
        }
      end


      def datatable_js_class
        @datatable_js_class ||= [*final_namespace, "#{@dt_id}-datatable".underscore.camelize].flatten.compact.join('.')
      end


      def datatable_id
        @datatable_id ||= [@namespace, @dt_id, 'datatable'].flatten.compact.join('-')
      end


      def final_namespace
        @final_namespace ||= @namespace.prepend(:datatables).map(&:to_s).map(&:camelize)
      end


      def table_content
        table_headers + table_body
      end


      def table_body
        tag.tbody('', @body_opts)
      end


      def table_headers
        tag.thead(table_row)
      end


      def table_row
        tag.tr(safe_join(@columns.map(&:to_s)))
      end


      def datatable_options
        {
          language: datatables_translations,
          columns: @columns.map(&:to_hash),
          buttons: @buttons,
          filters: @filters,
          filters_applied: @filters_applied,
        }.merge(@opts)
      end


      def link_to_select_all(selector)
        opts = { title: "#{t('button.check_all')}/#{t('button.uncheck_all')}" }
        check_box_tag("#{selector}-select_all", '1', false, opts)
      end

  end
end
