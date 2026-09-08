# frozen_string_literal: true

module DatatablesFactory
  class DataColumn

    def initialize(view, name, opts = {})
      @view      = view
      @name      = name
      @opts      = opts
      @css_class = nil
    end


    def to_s
      @view.tag.th(label, class: css_class)
    end


    # rubocop:disable-next Layout/LineLength
    def to_hash
      hash = { className: css_class, visible: visible?, orderable: sortable?, searchable: searchable?, width: width, data: @name, name: name }
      hash[:responsivePriority] = priority if priority
      hash
    end


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


    # Builds the column CSS classes without mutating the :class option given by
    # the caller (a shared/frozen Array would otherwise accumulate across calls).
    # Accepts both a String and an Array for :class.
    def css_class
      @css_class ||= begin
        css = Array(@opts.fetch(:class, [])).map(&:to_s)
        css += [@name.to_s]
        css << 'colvis' if colvis?
        css.join(' ')
      end
    end


    def width
      @opts.fetch(:width, '')
    end


    # Responsive drops columns from right to left as long as no priority is
    # declared; a lower priority survives longer. The key is omitted when the
    # caller gives none, so the plugin keeps its own default (10000) instead of
    # receiving a nil it would sort as a real value.
    def priority
      @opts[:priority]&.to_i
    end

  end
end
