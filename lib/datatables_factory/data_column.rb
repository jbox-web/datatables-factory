# frozen_string_literal: true

module DatatablesFactory
  class DataColumn

    def initialize(view, name, opts = {})
      @view = view
      @name = name
      @opts = opts
    end


    def to_s
      @view.tag.th(label, class: css_class)
    end


    # rubocop:disable Layout/LineLength
    def to_hash
      { className: css_class, visible: visible?, orderable: sortable?, searchable: searchable?, width: width, data: @name, name: name }
    end
    # rubocop:enable Layout/LineLength


    def label
      @opts.fetch(:label, '')
    end


    def name
      return 'Select All' if @name == :check_box

      label
    end


    def sortable?
      @opts.fetch(:sortable, true)
    end


    def searchable?
      @opts.fetch(:searchable, true)
    end


    def visible?
      @opts.fetch(:visible, true)
    end


    def colvis?
      @opts.fetch(:colvis, true)
    end


    def css_class
      css = @opts.fetch(:class, [])
      css << @name
      css << 'colvis' if colvis?
      css.join(' ')
    end


    def width
      @opts.fetch(:width, '')
    end

  end
end
