[![](https://cdn.discordapp.com/attachments/702871542933225504/932026376624668712/asdas.png)](https://discord.com/api/oauth2/authorize?client_id=931206635030982676&permissions=8&scope=bot%20applications.commands)


**Dokumentacja bota zarządzającego stworzonego na potrzeby serwera ogólnego**

<br>

>**Istotne (dla pewnych osób)**: Poprawnym określeniem na "discordowy serwer" jest gildia, w tej dokumentacji jednak używane jest określenie serwer

# Wyjaśnienie hierarchi rang

**Admin** - ranga nad każdą inną, ma pełną kontrole nad botem i serwerem

**Nauczyciel: ${nazwa_grupy}** - Ta ranga pozwala na bardziej konretne zarządzanie grupą, dla której dany użytkownik jest nauczycielem

**Nauczyciel** - ranga dla każdego nauczyciela, która odróżnia go od ucznia ale nie pozwala mu na "konkretniejsze" zarządzanie grupami, w których nie jest nauczycielem

**Uczeń** - ranga uczniów, służy przedewszystkim do zablokowania możliwości
przeglądania grup, do których dany uczeń nie 
należy

**Gość** - domyślna ranga 


# Komendy



## Konfiguracja
| Komenda | Opis | Minimalne permisje |
| --- | --- |---|
| **/setup** | Komenda **wymagana** do rozpoczęcia pracy z botem. Dodaje podstawowe role, dodaje serwer do bazy danych, ustawia potrzebne event listenery. (Dodawane role: `Nauczyciel`, `Admin`, `Gosc`, `Uczen` ) |  `Admin` |
| **/reset full** | Usuwa wszystkie grupy z bazy danych, usuwa wszystkie kanały grup, usuwa wszystkie role dodane przez bota, ustawia serwer jako "niezsetupowany", usuwa wszystkich nauczycieli i uczniów z grup | `Admin` |
| **/reset groups** | Usuwa wszystkie grupy, usuwa wszystkie kanały grup, usuwa wszystkie role związane z grupami, usuwa wszystkich nauczycieli i uczniów z grup  | `Admin` |

## Ogólne
| Komenda | Opis | Paramtery | Minimalne permisje |
| --- | --- | --- | --- |
| **/poll** | • Tworzy ankiete <br> • Maksymalnie 15 odpowiedzi <br> | `pytanie(string)`, <br> `Lista: opcje(string)` | `Admin` `Nauczyciel` |
| **/tasktracker** | • Wysyła na chat `tracker` progressu z zadaniami uczniów <br> • Uczeń należący do grupy, w której zrobiono tracker, może w ten sposób przekazać nauczycielowi informacje o jego postępie z zadaniami | `nazwa_grupy(role mention)`, <br> `Lista: zadania(string)` | `Admin` `Nauczyciel: ${nazwa_grupy}` |


## Dla grup
| Komenda | Opis | Parametry | Minimalne permisje |
| --- | --- |---| --- |
| **/addgroup** | • Każda nazwa jest zamieniana na format zgodny z formatem nazw kanałów tekstowych discord <br> • **Dodaje** grupe do bazy danych <br> • **Dodaje** wszystkie role (dodawane role: `Grupa: ${nazwa_grupy}`, `Uczen: ${nazwa_grupy}`, `Nauczyciel: ${nazwa_grupy}`) <br> • **Dodaje** kanały oraz kategorię, którą mogą widzieć tylko osoby z rangami: <br>`Nauczyciel`, `Uczen: ${nazwa_grupy}`, `Nauczyciel: ${nazwa_grupy}`, `Admin`. <br> | `nazwa_grupy(string)` `kategoria(string)` | `Admin` |
| **/removegroup** | • Usuwa wszystko to co dodała komenda: `/addgroup` | `nazwa_grupy(role mention)` | `Admin` |
| **/addteacher** | • Dodaje użytkownika jako nauczyciel <br> • Nadaje mu role `Nauczyciel` oraz role `${nazwa_grupy} - Nauczyciel ` | `nazwa_grupy(role mention)`, `użytkownik(user mention)` | `Admin` |
| **/removeteacher** | • Usuwa nauczyciela z grupy <br> • Usuwa mu role `${nazwa_grupy} - Nauczyciel` | `nazwa_grupy(role mention)`, `użytkownik(user mention)`  | `Admin` |
| **/addstudents** | • Dodaje **uczniów** do grupy <br> • Przypisuje każdemu uczniowi role `Uczen: ${nazwa_grupy}`, `Uczen` <br> • Komenda może przyjąć maksymalnie 6 arugmentów typu `użytkownik` (minimalnie 1)   | `nazwa_grupy(role mention)`, <br> `Lista: użytkownik(user mention)` | `Nauczyciel: ${nazwa_grupy}` |
| **/removestudent** | • Usuwa **uczniów** z grupy <br> • Usuwa każdemu uczniowi role `Uczen: ${nazwa_grupy}` <br> • Komenda może przyjąć maksymalnie 6 arugmentów typu `użytkownik` (minimalnie 1) |  `nazwa_grupy(role mention)`, <br> `Lista: użytkownik(user mention)` | `Nauczyciel: ${nazwa_grupy}` |

##### Dodatkowe informacje do komend
- Rola `Grupa: ${nazwa_grupy}` powstaje przy tworzeniu nowej grupy i służy jako parametr dla innych funkcji `nazwa_grupy(role mention)` np. **/addstudent**. W ten sposób lista grup wyświetla się przy wpisywaniu (bo dla discorda jest po prostu rolą)
- Kiedy uczeń dodany do grupy wyjdzie z serwera, będzie on dalej w bazie danych.
Gdy np. nauczyciel zrobi tasktracker dla grupy, w której znajduje się taki uczeń, imie ucznia wyświetli się jako `UCZEŃ WYSZEDŁ Z SERWERA`. 


## Event Listenery

**`guildMemberAdd`**
- kiedy użytkownik dołączy do serwera, otrzyma role `Gosc` (do działania wymagane jest zsetupowanie)



## Uruchamianie
**Wymagany jest plik .env z taką strukturą**
```Makefile
BOT_TOKEN=<TOKEN BOTA DISCORD>
APP_ID=<ID APLIKACJI DISCORD>
DEV_SERVER_ID=<DEV ONLY, ID SERWERA DISCORD POD DEVELOPMENT>
DB_USER=<LOGIN DO MONGODB>
DB_PASS=<HASŁO DO MONGODB>
MAX_CMD_ARGUMENT_LIST_LENGTH=<MAKSYMALNA DŁUGOŚĆ LISTY PARAMETRÓW JAKĄ MOŻE MIEĆ KOMENDA (np. ile uczniów maksymalnie można jednorazowo dodać do grupy)>
```

**Bot może działać w trybie `Development` oraz w trybie `Production`** <br>
- W trybie **Development** rejestruje komendy na lokalnym serwerze discord *(ustawionym w pliku .env)*, zgodnie z zaleceniami Discord API
- W trybie **Production** rejestruje komendy globalnie, zgodnie z zaleceniami Discord API


**Uruchamianie w trybie Production**: <br>
`npm run-script start:prod` <br>

**Uruchamianie w trybie Development**: <br>
`npm run-script start:dev`
<br><br><br>

## Przykładowy setup na serwerze dla...
- 4 grupowej szkoły
- Każda grupa jest w kategorii "poniedzialek"
- Na każdą grupe jest 1 nauczyciel
- W każdej grupie jest 5 uczniów
```
/setup

/addgroup Klasa1 poniedzialek
...
/addgroup Klasa4 poniedzialek

/addteacher @Grupa: Klasa1 @Nauczyciel1
...
/addteacher @Grupa: Klasa4 @Nauczyciel4

/addstudents @Grupa: Klasa1 @Uczen1a @Uczen1b @Uczen1c @Uczen1d @Uczen1e
...
/addstudents @Grupa: Klasa4 @Uczen4a @Uczen4b @Uczen4c @Uczen4d @Uczen4e
```

<br><br><br><br><br>
maintained by **@github/foealke**


