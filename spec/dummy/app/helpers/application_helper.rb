# frozen_string_literal: true

module ApplicationHelper

  SUPPORTED_DATATABLES_VERSIONS = %w[2 3].freeze

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

end
