# frozen_string_literal: true

module DatatablesFactory
  class Engine < ::Rails::Engine

    initializer 'datatables_factory.view_helper' do
      ActiveSupport.on_load(:action_view) do
        include DatatablesFactory::ViewHelper
      end
    end

  end
end
