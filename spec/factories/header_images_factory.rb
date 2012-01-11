require 'assets/header_image'

include Mulberry::Asset

FactoryGirl.define do
  factory :header_image do
    asset             SampleFiles.get_sample_image
    parent_assets_dir SampleFiles.parent_assets_dir
    after_build{
      require 'fakefs'
      FakeFS::FileSystem.clone(SampleFiles.get_sample_image)
    }
  end
end
