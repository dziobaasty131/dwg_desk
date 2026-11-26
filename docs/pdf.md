# Praca na PDF

[← README](../README.md)

Od wersji 1.4.0 PDF może służyć jako podkład do pomiarów i projektowania instalacji. Obsługa działa lokalnie, także dla skanów, dokumentów wielostronicowych oraz stron z obrotem lub przycięciem.

1. Kliknij **Otwórz rysunek** i wybierz PDF albo przeciągnij go do okna.
2. Wybierz stronę strzałkami lub wpisując jej numer na pasku PDF.
3. Ustaw skalę: wpisz np. **100** dla planu 1:100 i kliknij **Ustaw**. Jeśli skala wydruku jest niepewna, wybierz **Skalibruj odcinek**, wskaż dwa końce znanego wymiaru i wpisz rzeczywistą długość w metrach.
4. Używaj **Mierz** oraz **Projektuj**: dodawaj warstwy, kable, kamery, punkty, opisy i flagi długości. Symbole można przesuwać i obracać, a bibliotekę wykorzystywać tak jak przy DWG.
5. Kliknij **Zapisz PDF** lub **Cmd+S**, aby zapisać nową kopię dokumentu ze wszystkimi stronami i naniesionymi elementami.

## Skala i pomiary

PDF opisuje rozmiar strony, ale zwykle nie określa rzeczywistych jednostek planu. Program nie zgaduje skali: przed jej ustawieniem wyniki mają jednostkę **pkt PDF**. Po kalibracji pomiary i flagi tras pokazują rzeczywiste długości, a jednostkę wyniku można zmienić w panelu Pomiary. Kalibracja nie przesuwa narysowanych elementów — przelicza wartości odległości.

Skala jest osobna dla każdej strony. Jedna strona może zawierać kilka rysunków w różnych skalach; wtedy pomiary są poprawne wyłącznie w obszarze odpowiadającym ustawionej skali. Przy zniekształconym skanie kalibracja nie usuwa nierównomiernego rozciągnięcia obrazu.

## Strony, zapis i dalsza edycja

Każda strona ma własne warstwy robocze, obiekty i kalibrację, zapisywane automatycznie w lokalnym projekcie. Pomiary są tymczasowe i znikają przy zmianie strony; można wcześniej zapisać CSV. Przyciąganie działa do dodanych kabli i symboli; podkład PDF nie jest zamieniany na geometrię CAD.

Zapis PDF zachowuje oryginalne strony i dodaje geometrię oraz tekst z widocznych warstw projektu. Ukryte warstwy robocze nie są nanoszone. Wektorowy podkład pozostaje wektorowy, a skany pozostają obrazami. Polskie opisy korzystają z osadzonego fontu. Zapis nie wymaga ODA File Converter.

Zapisany PDF otwiera się w zwykłych czytnikach bez lokalnego projektu. Aby dalej edytować parametry kamer i automatyczne flagi w DWG Desk, otwórz oryginalny PDF — jego lokalny projekt zawiera edytowalne obiekty. Wyeksportowany plik ma inną zawartość i jest osobnym podkładem; jego kalibrację należy ustawić ponownie. Oryginał pozostaje bez zmian.

## Zakres obsługi

- Do 150 MB i 1000 stron. Szczegółowość podglądu zwiększa się przy powiększaniu, do limitu 16 mln pikseli na render strony i 8192 pikseli na bok. Limit podglądu nie rasteryzuje eksportowanego podkładu.
- PDF chroniony hasłem wymaga kopii bez hasła. Podpisy cyfrowe nie są zachowywane jako ważne po naniesieniu zmian — używaj kopii roboczej.
- Program nie edytuje pierwotnego tekstu PDF, nie wykonuje OCR ani automatycznej konwersji PDF do DWG/DXF. Dodaje własną instalację na podkładzie.
- Tylko lokalne przetwarzanie; skrypty i odsyłacze dokumentu nie są uruchamiane w podglądzie.
