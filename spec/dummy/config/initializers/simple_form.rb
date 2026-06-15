# frozen_string_literal: true

SimpleForm.setup do |config|
  config.wrappers :default, class: :input do |b|
    b.use :html5
    b.use :input
  end
  config.default_wrapper = :default
end
