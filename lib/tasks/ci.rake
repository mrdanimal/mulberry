# Integration tests sometimes fail (need to mock the internet better)
# so for now, don't run them in integration mode
task :all_tests do
  Rake::Task['ci'].execute
  Rake::Task['integration'].execute
end

task :ci do

  setup_fail = false

#  ['builder:app_dev', 'spec', 'jasmine:ci', 'jshint'].each do |task|
  ['builder:app_dev'].each do |task|
    Rake::Task[task].invoke
	  setup_fail = true unless $?.exitstatus == 0
  end

  test_fail = system('jasmine-headless-webkit')

  Kernel.exit(1) if setup_fail || test_fail
end

task :travis do
  root = Mulberry::Framework::Directories.root

  # Repo comes without a local.props, so specs fail
  # installing android on Ubuntu isn't (yet) automateable
  # so just shove a dummy file there
  FileUtils.cp(
    File.join( root, 'spec', 'fixtures', 'android', 'local.properties'   ),
    File.join( Mulberry::Framework::Directories.project_templates, 'android' )
  )

  puts "Starting to run tests in #{Dir.pwd}"
  system("export PATH=/tmp/bin:$PATH && bundle exec rake ci")

  raise "`rake test` failed!" unless $?.exitstatus == 0
end

task :default => :all_tests
