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
      # remove_button : croix de suppression sur chaque tag (parité select2)
      opts = opts.deep_merge(filter_type: 'multi_select', filter_plugin_options: { plugins: ['remove_button'] })
      select_field(name, opts, container_opts)
    end


    def render_datatable
      @datatable.render_datatable
    end


    private


      def select_field(name, opts = {}, container_opts = {})
        opts = select_plugin_defaults(opts).deep_merge(opts)
        basic_field(name, opts, container_opts)
      end


      # Plugin defaults — an explicit opts[:filter_plugin] wins over the tom-select default
      def select_plugin_defaults(opts)
        if opts[:filter_plugin] == 'select2'
          defaults = { filter_plugin_options: { minimumResultsForSearch: '-1' } }
          defaults[:filter_plugin_options][:width] = 'element' if opts[:filter_type] == 'multi_select'
        else
          # dropdownParent: body — sinon le dropdown est clippé par l'overflow des en-têtes DataTables
          defaults = { filter_plugin: 'tom-select', filter_plugin_options: { dropdownParent: 'body' } }
          # controlInput readonly : désactive la saisie (selects simples = liste courte) tout en
          # gardant l'input dans le DOM — sinon TomSelect ne rend pas le placeholder (input détaché).
          # data-bwignore/autocomplete : empêche l'autofill des gestionnaires de mots de passe (Bitwarden…)
          if opts[:filter_type] == 'select'
            defaults[:filter_plugin_options][:controlInput] =
              '<input type="text" readonly autocomplete="off" data-bwignore="1" data-lpignore="true" data-1p-ignore>'
          end
        end
        defaults
      end


      def basic_field(name, opts = {}, container_opts = {})
        # Set container_id
        container_id = id_for_container(name)
        label = opts.delete(:filter_default_label) { @template.label_filter_by(name) }

        # Treat search field options
        column_id = column_id_for(name)
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


      # A filter whose name matches no declared column would silently ship
      # column_id: null to the JS side: the filter renders, filters nothing and
      # reports no error. Fail loudly at render time instead.
      def column_id_for(name)
        column_id = @datatable.column_names.index(name)
        return column_id if column_id

        raise ArgumentError,
              "unknown column '#{name}' for filter — declared columns are: #{@datatable.column_names.join(', ')}"
      end

  end
end
