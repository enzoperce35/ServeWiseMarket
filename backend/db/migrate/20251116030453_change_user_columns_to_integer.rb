class ChangeUserColumnsToInteger < ActiveRecord::Migration[8.0]
  def up
    # convert existing data safely
    execute <<-SQL
      ALTER TABLE users
      ALTER COLUMN district TYPE integer USING CASE
        WHEN district = 'sampaguita_homes' THEN 0
        WHEN district = 'sampaguita_west' THEN 1
        ELSE 0
      END;
    SQL

    execute <<-SQL
      ALTER TABLE users
      ALTER COLUMN subphase TYPE integer USING CASE
        WHEN subphase = 'phase_1' THEN 0
        WHEN subphase = 'phase_2' THEN 1
        WHEN subphase = 'phase_3' THEN 2
        WHEN subphase = 'phase_4' THEN 3
        WHEN subphase = 'phase_5' THEN 4
        ELSE 0
      END;
    SQL

    # set defaults and NOT NULL constraints
    change_column_default :users, :district, 0
    change_column_null :users, :district, false

    change_column_default :users, :subphase, 0
    change_column_null :users, :subphase, false
  end

  def down
    change_column :users, :district, :string
    change_column :users, :subphase, :string
  end
end
