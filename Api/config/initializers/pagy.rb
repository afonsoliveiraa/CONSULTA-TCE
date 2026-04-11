# config/initializers/pagy.rb
# Na v43, você define as opções globais diretamente em Pagy::OPTIONS
Pagy::OPTIONS[:limit]   = 20
Pagy::OPTIONS[:jsonapi] = true # Se você quiser o padrão ?page[number]=2