# -*- coding: utf-8 -*-
import sqlite3

storage_dir = '_GIAB_HG002'
signal_size = 512

coverage = open(f'{storage_dir}/storage.bcov', 'rb')
con = sqlite3.connect(f'{storage_dir}/index.db')
cur = con.cursor()

cur.execute("SELECT s.id, s.start, s.end, s.type, s.side, s.coverage_offset, "
            "t.name, t.population, t.meancov FROM signal as s "
            "LEFT JOIN target AS t ON t.id = s.target_id LIMIT 10")

names = list(map(lambda x: x[0], cur.description))

for row in cur.fetchall():
    item = dict(zip(names, row))
    coverage.seek((item['coverage_offset']) * 2)
    bin = coverage.read((item['end'] - item['start'] + 1) * 2)
    print(item)
