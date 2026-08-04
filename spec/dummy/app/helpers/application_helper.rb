# frozen_string_literal: true

module ApplicationHelper

  SUPPORTED_DATATABLES_VERSIONS = %w[2 3].freeze
  SUPPORTED_JQUERY_VERSIONS     = %w[3 4].freeze

  # The dummy app ships one vendored DataTables bundle per supported major
  # version so the system specs can run against both. Select with DT_VERSION.
  def datatables_version
    version = ENV.fetch('DT_VERSION', '2')
    return version if SUPPORTED_DATATABLES_VERSIONS.include?(version)

    raise ArgumentError, "Unsupported DT_VERSION: #{version.inspect} (supported: #{SUPPORTED_DATATABLES_VERSIONS.join(', ')})"
  end


  def datatables_bundle_js_path
    "/javascripts/datatables#{datatables_version}.bundle.min.js"
  end


  def datatables_bundle_css_path
    "/stylesheets/datatables#{datatables_version}.bundle.min.css"
  end


  # jQuery 4 dropped a batch of APIs the library used to call ($.trim among
  # them), so the suite has to run against both majors, not just the one the
  # host application happens to ship today. Select with JQ_VERSION.
  def jquery_version
    version = ENV.fetch('JQ_VERSION', '3')
    return version if SUPPORTED_JQUERY_VERSIONS.include?(version)

    raise ArgumentError, "Unsupported JQ_VERSION: #{version.inspect} (supported: #{SUPPORTED_JQUERY_VERSIONS.join(', ')})"
  end


  def jquery_js_path
    "/javascripts/jquery#{jquery_version}.min.js"
  end

end
