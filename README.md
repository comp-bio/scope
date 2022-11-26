# SCOPE – Sequence COverage ProfilE

## О проекте

База данных сигналов покрытий содержит данные о покрытии генома вблизи точек разрыва структурных вариантов. 
Все значения покрытия сохраняются без нормализации и без сжатия. Для каждого сигнала в базе данных указано, 
какой из точек разрыва структурного варианта использовался: левый (L), правый (R), левый и правый совпадают (BP), 
специальный тип (svPB). Для каждого сигнала в базе данных хранится информация об образце, из которого он был получен. 

На визуализации точка разрыва расположен ровно по центру (выделен вертикальной красной линией). 
Горизонтальная синяя линия — это среднее покрытие для образца, из которого был получен сигнал. 

Источники данных: 
* GIAB образец HG002, 
* Трио YRI, CHS и PUR из работы Chaisson et al [Chaisson, Mark J P et al. “Multi-platform discovery of haplotype-resolved structural variation in human genomes.” Nature communications vol. 10,1 1784. 16 Apr. 2019].

Хранилище (например, `EXAMPLE`) это готовая к визуализации база данных вместе с файлом сигналов и мета-файлом:
* `EXAMPLE/index.db` — SQLite база данных
* `EXAMPLE/storage.bcov` — Все сигналы со значениями покрытий в bcov формате
* `EXAMPLE/overview.json` — Мета информация о проекте

## 1. Как развернуть локальную БД:

1.1 Зависимости
Инструменты написаны с использованием `python3`, Вам потребуются следующие зависимости:

```bash
pip3 install flask tslearn gevent 
```

1.2 Скачайте собранный интерфейс
```bash
wget https://scope.compbio.ru/supplement/scope-27-Nov-2022.zip
unzip scope-27-Nov-2022.zip
```

1.3 Скачайте хранилище данных с сигналами
```bash
wget https://scope.compbio.ru/supplement/_CHM_GIAB.zip
unzip _CHM_GIAB.zip
```

1.4 Запустите веб-сервер со скачанным хранилищем:
```bash
python3 server.py db:_CHM_GIAB port:8888 dev:yes
```

Готово. Ваш интерфес работает в браузере по адресу: [http://127.0.0.1:8888/](http://127.0.0.1:8888/)

![](./supplement/oneface.png)

Описание параметров скрипта запуска веб-сервера:

```text
python3 server.py \
  db:[путь к директории хранилища] \
  port:[порт, стандартно: 9915] \
  dev:[режим разработки (app.run), стандартно (WSGIServer)] \
  sax:[ширина SAX-преобразования для визуализации, стандартно: 64] \
  alphabet:[алфавит SAX-преобразования, стандартно: 24]
```

## 2. Создание собственного хранилища сигналов

!Внимание: Создание собственного хранилища требует большого объёма дискового пространства

2.2.1 Создание файлов покрытия (.bcov) из данных секвенирования

> Схема: (.bam или .cram) -> mosdepth -> (.per-base.bed.gz) -> bed2cov -> (.bcov)

Извлечение глубины покрытия из .bam или .cram файлов производится инструментом
[mosdepth](https://github.com/brentp/mosdepth)
Для извлечение покрытий из .cram файлов потребуется указать референсный геном: 
http://ftp.ensembl.org/pub/current_fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.toplevel.fa.gz

Пример:

```bash
mosdepth -t 24 -f Homo_sapiens.GRCh38.dna.toplevel.fa "OUTPUT" Sample.cram
```

В результате будет получен BED файл. Сконвертировать его в bcov можно инструментом bed2cov

```bash
mkdir -p "OUTPUT" && cd "OUTPUT"
gzip -cd ../OUTPUT.per-base.bed.gz | ./tools/bed2cov # Или bed2cov_Darwin для Mac OSX
```

2.2.2 .meta Файл

Наименования образцов в VCF файлах могут отличаться от наименований файлов. 
Вам потребуется создать вручную файл соответствий директорий BCOV названиям в VCF.
Колонки: `sample_accession` `sample` `population` `sex` `meancov`  
`sample_accession` — название в vcf  
`sample` директория .bcov покрытий  
`population` `sex` `meancov` — Популяция, пол, среднее покрытие образца. Эти поля пойдут напрямую в базу данных

Пример:

```text
sample_accession sample population sex meancov
NA12878 HG001 Default F 272.02
HG002 HG002 Ashkenazim M 53.27
HG003 HG003 Ashkenazim M 45.94
HG004 HG004 Ashkenazim F 52.54
HG005 HG005 Chinese M 14.96
HG006 HG006 Chinese M 17.26
HG007 HG007 Chinese F 16.65
```

```
┌─────────────────┬───────┬───────────┬────┬────────┐
│sample_accession │sample │population │sex │meancov │
├─────────────────┼───────┼───────────┼────┼────────┤
│NA12878          │HG002  │Ashkenazim │F   │272.02  │
└─┬───────────────┴─┬─────┴─┬─────────┴────┴─┬──────┘
  │                 │       │                │
  ▼                 │       ▼                │
 Sample name        │      Population        │
 from .vcf file     │      name (any string) └────────┐
                    ▼                                 │
 Directory name with depth-of-coverage (DOC) values.  │
 For example, DOC values for NA12878 are located in   │
 directory HG002: /path-to-bcov/HG002/chr{1..22}.bcov │
                                                      │
 Mean coverage for the genome. The value is in file ◄─┘
 *.mosdepth.summary.txt, line:total
```


2.2.3. Импорт VCF файлов и создание БД (инструменты `./tools/import_vcf.py` `./tools/import_coverage.py`):

> Схема: (.bcov + .meta + .vcf) -> (collection)

Usage:

```text
python3 tools/import_vcf.py \
  db:[путь к директории хранилища] \
  vcf:[путь к vcf или vcf.gz файлам] \
  meta:[meta файл] \
  name:[название датасета] \
  offset:[отступ от точки разрыва (число, >16, стандартно: 256)] \
  genome:[версия генома человека, стандартно GRCh38] \
  special:[сохранять структурные вариации маленького размера? Укажите имнимальный размер в базах] \
  spp:[сдвиг точки интереса относительно центра SV (от 0 до 1), стандартно 0.5, середина SV]
```

Пример:

```bash
for vcf in /projects/HGDP/SV/*.vcf; do
  python3 ./tools/import_vcf.py db:_HGDP \
   name:HGDP vcf:$vcf \
   meta:HGDP/HGDP.metadata
done
```

После импорта VCF загрузите покрытия

Usage:

```text
python3 ./tools/import_coverage.py \
  db:[путь к директории хранилища] \
  path:[путь к директории с покрытиями bcov] \
  name:[название датасета]
```

Пример:

```bash
python3 ./tools/import_coverage.py db:_HGDP name:HGDP path:HGDP/cram/
```

После импорта создайте обзорный файл для интерфейса:

```text
python3 ./tools/overview.py \
  db:[путь к директории хранилища]
```

