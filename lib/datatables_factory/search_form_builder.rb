# frozen_string_literal: true

module DatatablesFactory
  class SearchFormBuilder < ActionView::Helpers::FormBuilder

    def initialize(object_name, object, template, options)
      @datatable = options[:datatable]
      super
    end


    def text_field(name, opts = {}, container_opts = {})
      opts = opts.deep_merge(filter_type: 'text')
      basic_field(name, opts, container_opts)
    end


    def range(name, opts = {}, container_opts = {})
      opts = opts.deep_merge(filter_type: 'range_number')
      basic_field(name, opts, container_opts)
    end


    def range_date(name, opts = {}, container_opts = {})
      opts = opts.deep_merge(filter_type: 'range_date')
      basic_field(name, opts, container_opts)
    end


    def select(name, opts = {}, container_opts = {})
      opts = opts.deep_merge(filter_type: 'select')
      select_field(name, opts, container_opts)
    end


    def multi_select(name, opts = {}, container_opts = {})
      opts = opts.deep_merge(filter_type: 'multi_select', filter_plugin_options: { width: 'element' })
      select_field(name, opts, container_opts)
    end


    def render_datatable
      @datatable.render_datatable
    end


    private


      def select_field(name, opts = {}, container_opts = {})
        opts = opts.deep_merge(filter_plugin: 'select2', filter_plugin_options: { minimumResultsForSearch: '-1' })
        basic_field(name, opts, container_opts)
      end


      def basic_field(name, opts = {}, container_opts = {})
        # Set container_id
        container_id = id_for_container(name)
        label = opts.delete(:filter_default_label) { @template.label_filter_by(name) }

        # Treat search field options
        column_id = @datatable.column_names.index(name)
        opts = opts.deep_merge(filter_container_id: container_id, filter_default_label: label, column_id: column_id)

        # Treat container options
        container_opts = container_opts.merge(id: container_id)

        # Set search field
        @datatable.search_field(opts)
        @template.tag.div('', **container_opts)
      end


      def id_for_container(name)
        "#{@datatable.dt_id}_#{name}_filter".dasherize
      end

  end
end
