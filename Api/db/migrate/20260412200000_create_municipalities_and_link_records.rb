class CreateMunicipalitiesAndLinkRecords < ActiveRecord::Migration[8.0]
  def up
    create_table :municipalities do |t|
      t.string :code, null: false
      t.string :name

      t.timestamps
    end

    add_index :municipalities, :code, unique: true

    add_reference :contracts, :municipality, foreign_key: true
    add_reference :biddings, :municipality, foreign_key: true
    add_reference :vehicles, :municipality, foreign_key: true

    backfill_municipalities(:contracts)
    backfill_municipalities(:biddings)
    backfill_municipalities(:vehicles)
  end

  def down
    remove_reference :vehicles, :municipality, foreign_key: true
    remove_reference :biddings, :municipality, foreign_key: true
    remove_reference :contracts, :municipality, foreign_key: true

    drop_table :municipalities
  end

  private

  def backfill_municipalities(table_name)
    say_with_time "Relacionando #{table_name} aos municipios existentes" do
      rows = select_rows(<<~SQL)
        SELECT DISTINCT cod_municipio
        FROM #{table_name}
        WHERE cod_municipio IS NOT NULL
          AND cod_municipio <> ''
      SQL

      rows.flatten.each do |municipality_code|
        municipality_id = find_or_create_municipality_id(municipality_code)

        execute <<~SQL
          UPDATE #{table_name}
          SET municipality_id = #{municipality_id}
          WHERE cod_municipio = #{quote(municipality_code)}
            AND municipality_id IS NULL
        SQL
      end
    end
  end

  def find_or_create_municipality_id(municipality_code)
    existing_id = select_value(<<~SQL)
      SELECT id
      FROM municipalities
      WHERE code = #{quote(municipality_code)}
      LIMIT 1
    SQL

    return existing_id if existing_id.present?

    execute <<~SQL
      INSERT INTO municipalities (code, created_at, updated_at)
      VALUES (#{quote(municipality_code)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    SQL

    select_value(<<~SQL)
      SELECT id
      FROM municipalities
      WHERE code = #{quote(municipality_code)}
      LIMIT 1
    SQL
  end
end
