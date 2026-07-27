# frozen_string_literal: true

# Appraisals are generated from spec/dummy/Gemfile, which is the bundle the
# specs actually run against (bin/rspec defaults BUNDLE_GEMFILE to it, and
# honours an explicit one — which is what appraisal sets).
#
#   BUNDLE_GEMFILE=spec/dummy/Gemfile bundle exec appraisal install
#   BUNDLE_GEMFILE=spec/dummy/Gemfile bundle exec appraisal rails_8.0 rspec
#
# The gemspec allows rails >= 7.2; keep one entry per supported major.

appraise 'rails_7.2' do
  gem 'rails', '~> 7.2.0'
end

appraise 'rails_8.0' do
  gem 'rails', '~> 8.0.0'
end

appraise 'rails_8.1' do
  gem 'rails', '~> 8.1.0'
end
