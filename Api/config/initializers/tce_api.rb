# config/initializers/tce_api.rb

json_path = Rails.root.join('lib', 'tce_specs.json')

if File.exist?(json_path)
  file_content = File.read(json_path)
  TCE_ENDPOINTS = JSON.parse(file_content)['paths'].keys.map do |path|
    path.gsub(/^\//, '')
  end.freeze
else
  # Isso evita que a aplicação quebre se o arquivo sumir, 
  # mas te avisa no console
  puts "AVISO: Arquivo lib/tce_specs.json não encontrado!"
  TCE_ENDPOINTS = [].freeze
end