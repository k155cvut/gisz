---
icon: material/numeric-10-box
title: Cvičení 10
---

# QGIS – online publikace dat

## Cíl cvičení

Ukázka publikace dat z prostředí QGIS do webového prostoru pomocí publikační platformy **Gisquick**.

## Základní pojmy

- [**QGIS**](https://qgis.org) – jeden z nejpoužívanějších open source GIS nástrojů v praxi
- [**Gisquick**](https://gisquick.org/) – jedna z volně dostupných publikačních open source platforem pro QGIS

## Použité datové podklady

- [RÚIAN](../../data/#ruian)
- [ZABAGED](../../data#zabaged-polohopis)
- [Prohlížecí služby ČÚZK - WMTS](https://geoportal.cuzk.cz/(S(2eblduiqqs0a0zubvb2ofuit))/Default.aspx?mode=TextMeta&side=wmts.uvod&text=wmts.uvod&head_tab=sekce-03-gp&menu=315)
- [Stahovací služby ČÚZK - WFS](https://geoportal.cuzk.cz/(S(2eblduiqqs0a0zubvb2ofuit))/Default.aspx?mode=TextMeta&side=wfs&text=wfs&head_tab=sekce-03-gp&menu=333)
- [OpenStreetMap](../../data#openstreetmap)

## Náplň cvičení

Pro naši zájmovou obec či menší město zpracujeme projekt v QGIS určený pro online publikaci.

### Příprava projektu

Nahrajte do prostředí QGIS vstupní geografická data. Pro jednotlivé vrstvy nastavte styl vykreslování.

!!! warning "Důležité"

    Nejprve vytvoříme na disku novou složku, do které posléze uložíme QGIS projekt a všechny lokální datové zdroje (v našem případě to bude databázový formát OGC GeoPackage).

#### RÚIAN

Nainstalujeme zásuvný modul pro práci s datovým zdrojem RÚIAN (viz [předchozí cvičeni](./cviceni9.md)).

![](../assets/cviceni9/plugin_install.png "Instalace pluginu")

Vybereme zájmovou obec či menší město a data stáhneme pomocí zásuvného modulu RÚIAN.

![](../assets/cviceni10/ruian_download.png "Stažení dat RÚIAN")

Výchozí symbologie vrstev je nastavena zásuvným modulem:

![](../assets/cviceni10/ruian_data.png "Data RÚIAN")

!!! note "Poznámka"

    Seznam vrstev je ovlivněn dostupností datových vrstev. U menších obcí může například chybět vrstva ulic a další.
    
    ![](../assets/cviceni10/ruian_layers.png "Seznam vrstev RÚIAN")
    
Provedeme v projektu následující změny:

- odstraníme vrstvu "Části obcí" a "Adresní body"
- vypneme vrstvu "Katastrální území"
- přípojíme k vrstvě "Parcely" číselník (viz [předchozí cvičeni](./cviceni9.md)):   
    - [SC_D_POZEMKU](https://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Ciselniky-ISKN/Ciselniky-k-nemovitosti/Druh-pozemku.aspx)
!!! warning "Důležité"
    Data načítejte namísto prostého přetažení pomocí dialogu `Layer > Data Source Manager`. V tomto případě se korektně nastaví datové typy sloupců. Kódování znaků nastavíme na `windows-1250`.
    
    ![](../assets/cviceni10/ruian_csv.png "Přidání CSV tabulek do projektu")
    
![](../assets/cviceni10/ruian_csv_detail.png "Připojená CSV data")

!!! task-fg-color "Úkol"

    Podobně přípojíme číselník k vrstvě "Stavební objekty": [SC_ZP_VYUZITI_BUD](https://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Ciselniky-ISKN/Ciselniky-k-nemovitosti/Zpusob-vyuziti-stavby.aspx)

    ![](../assets/cviceni10/ruian_csv_join.png "Připojení CSV dat k vektorové vrstvě")

    Případně i další další číselníky jako např. [SC_ZP_VYUZITI_POZ](https://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Ciselniky-ISKN/Ciselniky-k-nemovitosti/Zpusob-vyuziti-pozemku.aspx) a další.
    
- na základě připojených číselníků nastavíme symbologii vrstev

![](../assets/cviceni10/ruian_style.png "Nastavený styl parcel")

!!! tip

    Ukázkové styly ke stažení [zde](https://geo.fsv.cvut.cz/vyuka/155gis1/gis1_cv10_styly.zip).

![](../assets/cviceni10/ruian_style_buildings.png "Nastavení stylu u stavebních objektů")

- popisky nastavme tak, aby se zobrazovaly od měřítka 1:1000 (parcelní číslo, číslo domovní)

!!! tip

    U stavebních objektů můžeme nastavit číslo domovní pomocí funkce `regexp_substr`: `replace(regexp_substr("CisloDomovni", '(:\\d+)'), ':', '')`
    
    ![](../assets/cviceni10/ruian_regex.png "Popisky stavebních objektů")

- u vrstvy "Základní sídelní jednotky" nastavíme popisky podle atributu "Nazev" (pouze do měřítka 1:5000), nastavíme podklad textu

- nastavíme cílové pořadí vrstev

![](../assets/cviceni10/ruian_result.png "Pořadí vrstev RÚIAN")

#### WMS zdroje

Do projektu přidáme vybrané [WMS
služby](https://geoportal.cuzk.cz/(S(ktfz4kwhtke20faayarg2abz))/Default.aspx?mode=TextMeta&side=wms.verejne&text=WMS.verejne.uvod&headtab=sekce-03-gp&menu=311)
poskytované ČÚZK. Pokud existuje ale ekvivalentní [WMTS](
https://geoportal.cuzk.cz/(S(ktfz4kwhtke20faayarg2abz))/Default.aspx?mode=TextMeta&side=wmts.uvod&text=wmts.uvod&head_tab=sekce-03-gp&menu=315)
služba, zvolíme raději tuto formu. WMTS by měla pozitivně ovlivnit
rychlost načítání vrstvy.

- ZTM5 - `https://ags.cuzk.cz/arcgis1/rest/services/ZTM/MapServer/WMTS`
- Ortofoto - `https://ags.cuzk.cz/arcgis1/rest/services/ORTOFOTO/MapServer/WMTS`
   
Služby přidáme pomocí `Layer > Data Source Manager`:

![](../assets/cviceni10/cuzk_wms.png "Definici WMS služby")

Přidané WMS služby nahrajeme do mapového okna. 

!!! tip

    WMS vrstvy je užitečné seskupit do nové skupiny:
    
    ![](../assets/cviceni10/cuzk_wms_group.png "Seskupení WMS vrstev")

Dalším z datových zdrojů mohou být WMS služby poskytované agenturou
[CENIA](https://micka.cenia.cz/record/basic/50211b47-f954-4258-9b61-1951c0a80137). Pro náš
účel vyberme III. vojenské mapování: `https://gis.cenia.cz/mapcache/III_vojenske_mapovani/wmts?SERVICE=WMTS&REQUEST=GetCapabilities`:

![](../assets/cviceni10/wms_cenia.png "Vrstva III. vojenského mapování")

!!! task-fg-color "Úkol"

    Přidejte do projektu další zdroje dat jako např. Stínovaný model reliéfu - `https://ags.cuzk.cz/arcgis2/services/dmr5g/ImageServer/WMSServer`:
    
    - dmr5g:GrayscaleHillshadeZ10
   
    Dojem plastičnosti můžeme dosáhnout kombinací Základní topografické
    mapy při dané míře průhlednosti. Ukázka vizualizace při míře transparentnosti
    75%:
   
    ![](../assets/cviceni10/cuzk_ztm5.png "Ukázka vizualizace Základní topografické mapy")

#### WFS zdroje

Do projektu přidáme vybrané [WFS
služby](https://geoportal.cuzk.cz/(S(ktfz4kwhtke20faayarg2abz))/Default.aspx?mode=TextMeta&side=wfs&text=wfs&head_tab=sekce-03-gp&menu=333)
poskytované ČÚZK. Vybereme následující vrstvy z datového zdroje
"Stahovací služba WFS - ZABAGED® - polohopis"
(`https://ags.cuzk.cz/arcgis/services/ZABAGED_POLOHOPIS/MapServer/WFSServer`):

- `Lesní_půda_se_stromy_kategorizovaná__plocha_`
- `Vodní_plocha`
- `Vodní_tok`

![](../assets/cviceni10/zabaged_layers.png "Seznam WFS vrstev ZABAGED")

U jednotlivých vrstev nastavíme symbologii a vrstvy přejmenujeme:

![](../assets/cviceni10/zabaged_styl.png "Nastavení stylu u WFS vrstev")

!!! warning "Důležité"

    Vrstvy, u kterých budeme nastavovat kategorizovaný styl doporučujeme stáhnout do lokální databáze ve formátu GeoPackage (`Export > Save features as`):

    ![](../assets/cviceni10/zabaged_db.png "Uložení dat do nového GeoPackage")

    Při stažení dat nastavte korektně zájmové území(!!!):
    
    ![](../assets/cviceni10/wfs_download_canvas.png "Stažení dat WFS zájmové oblasti")

    Kategorizované styly jsou ke stažení [zde](https://geo.fsv.cvut.cz/vyuka/155gis1/gis1_cv10_styly.zip).
    
Na závěr nastavme výchozí kompozici. V našem případě jsou parcely
nastaveny na průhlednost 50%. Na pozadí stínovaná základní
topografická mapa:

![](../assets/cviceni10/project_to_publish.png "Výsledný projekt před publikací")

!!! task-fg-color "Úkol"

    Přidejte do projektu další vhodné WFS vrstvy z datového zdroje ZABAGED, jako např.:
    
    - `Stožár_elektrického_vedení`
    - `Mohyla__pomník__náhrobek`
    - `Kříž__sloup_kulturního_významu`
    - `Úřad_veřejné_správy_-_definiční_bod`
    - `Škola_-_definiční_bod`
    - `Hasičská_stanice__zbrojnice_-_definiční_bod`
    - `Pošta_-_definiční_bod`
    - `Elektrické_vedení`
    - `Silnice__dálnice`
    - `Vodní_tok`
    - `Cesta`
    - `Železniční_trať`
    - `Hřbitov`
    - `Skládka`
    - `Maloplošné_zvlástě_chráněné_území`
    - `Vinice`

    Výsledek může pro zájmovou oblast vypadat následovně:

    ![](../assets/cviceni10/zabaged_result.png "Příklad datových vrstev ZABAGED")

    **Tip pro pokročilejší uživatele:** QGIS umožňuje také automatizaci ve formě Python skriptů. Ukázka skriptu níže:
    
    - stáhne vybrané vrstvy z WFS
    - ořeže prvky hranicí obce
    - uloží na disk ve formátu OGC GeoPackage
    
    ```py
    # download WFS layer and store in output GPKG
    def download_wfs_layer(url, typename_name, layer_ref, output_path, layer_name):
        # define WFS connection
        uri = f"pagingEnabled='true' preferCoordinatesForWfsT11='false' restrictToRequestBBOX='1' " \
              f"srsname='EPSG:5514' typename='{typename_name}' url='{url}' version='auto'"
        layer = QgsVectorLayer(uri, "WFS_Layer", "WFS")
        if not layer.isValid():
            return None

        options = QgsVectorFileWriter.SaveVectorOptions()
        options.driverName = "GPKG"
        options.layerName = layer_name
        options.filterExtent = layer_ref.extent()

        # define temporary output
        dest = QgsProcessingParameterVectorDestination(name=layer_name)
        layer_tmp_path = dest.generateTemporaryDestination()

        # download WFS data
        res = QgsVectorFileWriter.writeAsVectorFormatV3(
            layer,
            layer_tmp_path,
            layer.transformContext(),
            options
        )

        # fix invalid geometries
        proc = processing.run("native:fixgeometries", {
            'INPUT': layer_tmp_path,
            'METHOD':1,
            'OUTPUT': 'TEMPORARY_OUTPUT',
        })

        # clip features by reference layer
        processing.run('native:clip', {
            'INPUT': proc['OUTPUT'],
            'OVERLAY': layer_ref,
            'OUTPUT': f'ogr:dbname="{output_path}" table="{layer_name}" (geom)'
        })

    url = "https://ags.cuzk.cz/arcgis/services/ZABAGED_POLOHOPIS/MapServer/WFSServer"
    layers = [
        'ZABAGED_POLOHOPIS:Stožár_elektrického_vedení', 
        'ZABAGED_POLOHOPIS:Mohyla__pomník__náhrobek', 
        'ZABAGED_POLOHOPIS:Kříž__sloup_kulturního_významu', 
        'ZABAGED_POLOHOPIS:Úřad_veřejné_správy_-_definiční_bod', 
        'ZABAGED_POLOHOPIS:Škola_-_definiční_bod', 
        'ZABAGED_POLOHOPIS:Hasičská_stanice__zbrojnice_-_definiční_bod',
        'ZABAGED_POLOHOPIS:Pošta_-_definiční_bod',
        'ZABAGED_POLOHOPIS:Elektrické_vedení',
        'ZABAGED_POLOHOPIS:Silnice__dálnice',
        'ZABAGED_POLOHOPIS:Vodní_tok',
        'ZABAGED_POLOHOPIS:Cesta',
        'ZABAGED_POLOHOPIS:Železniční_trať',
        'ZABAGED_POLOHOPIS:Hřbitov',
        'ZABAGED_POLOHOPIS:Skládka',
        'ZABAGED_POLOHOPIS:Maloplošné_zvlástě_chráněné_území',
        'ZABAGED_POLOHOPIS:Vinice',
        'ZABAGED_POLOHOPIS:Lesní_půda_se_stromy_kategorizovaná__plocha_',
        'ZABAGED_POLOHOPIS:Vodní_plocha',
    ]

    output_path  = os.path.join(QgsProject.instance().readPath("./"), "zabaged.gpkg")
    group_name = "ZABAGED"

    # get reference layer
    layer_extent = QgsProject.instance().mapLayersByName('Obce')[0]

    # find/add group into layer tree
    root = QgsProject.instance().layerTreeRoot()
    group = root.findGroup(group_name)
    if group is None:
        group = root.insertGroup(0, group_name)

    for type_name in layers:
        print(f"Processing {type_name}...")
        layer_name = type_name.split(':')[1].replace('_', ' ')
        # remove non-ascii characters
        layer_output = re.sub(r'[^\x00-\x7F]', ' ', layer_name).replace(' ', '_').lower()

        download_wfs_layer(url, type_name, layer_extent, output_path, layer_output)
        # add new layer into layer tree
        layer_new = QgsVectorLayer(f"{output_path}|layername={layer_output}", layer_name, "ogr")
        QgsProject.instance().addMapLayer(layer_new, False)
        group.addLayer(layer_new)

    print("done")
    ```
    
    <video controls="true" allowfullscreen="true" width=99%>
    <source src="../../assets/cviceni10/qgis_wfs_download.webm" type="video/webm" markdown="1">
    </video>

#### Další zdroje dat

- [Národní katalog otevřených dat](https://data.gov.cz/datov%C3%A9-sady)
- [OpenStreetMap](https://wiki.openstreetmap.org/wiki/Cs:Map_Features)
- ...

!!! task-fg-color "Úkol"

    Přidejte do projektu vrstvu "Občanské vybavenosti" ([amenity](https://wiki.openstreetmap.org/wiki/Cs:Map_Features#Ob%C4%8Dansk%C3%A1_vybavenost_(Amenity))). 
    
    Doinstalujte do QGISu zásuvný modul QuickOSM a pomocí něj vytvořte vrstvu občanské vybavenosti (rozsah území nastavte na základě vrstvy "Obce"):
    
    ![](../assets/cviceni10/quick_osm.png "QuickOSM")
    
    Prvky ležící na území obce omezte pomocí nástroje *Clip* a uložte do nové vrstvy. Nastavte kategorizovanou symbologii podle atributu ``amenity`` a přeložte popisky v legendě do češtiny:
    
    ![](../assets/cviceni10/qgis_osm.png "Vrstva občanské vybavenosti")
    
    Přidejte do projektu další vhodné vrstvy na základě [OpenStreetMap](https://wiki.openstreetmap.org/wiki/Cs:Map_Features).

!!! note "Poznámka"

    Ukázkový QGIS projekt ke stažení [zde](https://geo.fsv.cvut.cz/vyuka/155gis1/gis1_cv10_projekt.zip).

### Publikace projektu

Podklady: [dokumentace Gisquick](https://gisquick.readthedocs.io)

!!! warning "Důležité"

    Pro účel výuky budeme používat vlastní instanci publikačního serveru Gisquick provozované na **<http://geo102.fsv.cvut.cz:8083/>**.

Po [přihlášení](http://geo102.fsv.cvut.cz:8083/user/) (`SIGN IN`) se objeví profil uživatele:

![](../assets/cviceni10/gisquick_new_project.png "Gisquick: nový projekt")

Vytvoříme nový projekt. Objeví se žádost o instalaci zásuvného modulu:

![](../assets/cviceni10/gisquick_plugin.png "Gisquick: instalace pluginu")

!!! note "Poznámka"

    Pokud se výše uvedená stránka neobjeví, tak ji najdete na <https://gisquick.org/plugin/>

Při instalaci postupuje podle [návodu](https://gisquick.readthedocs.io/en/latest/user-manual/before-publishing.html#qgis-gisquick-plugin) v dokumentaci Gisquick.

Jelikož pracujeme v projektu s formátem GeoPackage, tak nainstalujeme
verzi zásuvného modulu Gisquick s podporou dbhash. Tato verze
zásuvného modulu zamezí znovu nahrávání datových zdrojů ve formátu
GeoPackage například při změně viditelnosti vrstvy.

![](../assets/cviceni10/gisquick_plugin_select.png "Gisquick: instalace pluginu")

Poté se pomocí zásuvného modulu přihlásíme do prostředí publikační
platformy Gisquick (`Web > Publish in Gisquick`). 

![](../assets/cviceni10/gisquick_login.png "Gisquick: přihlášeni")

Do publikačního prostředí platformy Gisquick nás přesměruje tlačítko `Open Browser`:

![](../assets/cviceni10/gisquick_login_open.png "Gisquick: otevření")

Po vytvoření projektu se objeví úvodní formulář se seznamem vrstev určených k publikaci:

![](../assets/cviceni10/gisquick_data_layers.png "Gisquick: seznam vrstev")

Nejprve opravíme případné chyby (`Manage Layers Names` > `Generate Names` > `Update QGIS Project`):

![](../assets/cviceni10/gisquick_data_layers_errors.png "Gisquick: seznam chyb")

Dále povolíme WFS, abychom umožnili uživateli se dotazovat na vektorové vrstvy:

![](../assets/cviceni10/gisquick_data_layers_wfs.png "Gisquick: zapnutí WFS")

Datové vrstvy nahrajeme na publikační server:

![](../assets/cviceni10/gisquick_data_layers_load.png "Gisquick: nahrání dat")

![](../assets/cviceni10/gisquick_create_project.png "Gisquick: zadání jména projektu")

Nastavíme titulek projektu:

![](../assets/cviceni10/gisquick_title.png "Gisquick: zadání titulku projektu")

Projdeme jednotlivá nastavení projektu:

![](../assets/cviceni10/gisquick_menu.png "Gisquick: menu")

A provedeme následující změny v nastavení:

- `Map > Extent`: prostorový rozsah nastavíme z vrstvy "Obce":

<video controls="true" allowfullscreen="true" width=99%>
<source src="../../assets/cviceni10/gisquick_extent.webm" type="video/webm" markdown="1">
</video>
    
- `Map > Scale`: nastavíme vhodnou měřítkovou sadu:

    ![](../assets/cviceni10/gisquick_scales.png "Gisquick: měřítka")

- v záložce `Layers` přesuňte vrstvy ze skupiny "WMS" do `Base Layers` (je nutné přesunout celou skupinu)

![](../assets/cviceni10/gisquick_base_layers.png "Gisquick: podkladové vrstvy")

!!! tip "Tip pro pokročilé uživatele"

    Ke zrychlení načítání vrstev může dojít při vhodně zvolené měřítkové sadě dle [specifikace ČÚZK](https://geoportal.cuzk.cz/Dokumenty/Dlazdicove_sluzby_CR_v1.1.pdf). Případně lze použít WMTS s měřítkovou sadou Google Maps.
    

A připravený projekt publikujeme (`Publish`). Po publikaci projektu se objeví tlačítko

![](../assets/cviceni10/gisquick_map.png "Gisquick: mapová aplikace")

které nás přesměruje do mapové aplikace:

![](../assets/cviceni10/gisquick_map_app.png "Gisquick: zobrazení mapové aplikace")

!!! tip

    Ve výchozím nastavení je projekt nastaven jako soukromý. Toto nastavení lze změnit v `Permissions`:
    
    ![](../assets/cviceni10/gisquick_permissions.png "Gisquick: nastavení")

#### Další nastavení projektu

Zkusme změnit následující nastavení projektu:
    
- skryjeme CSV tabulky v záložce `Layers`

![](../assets/cviceni10/gisquick_csv_tables.png "Gisquick: CSV data")

<video controls="true" allowfullscreen="true" width=99%>
<source src="../../assets/cviceni10/gisquick_visibility.webm" type="video/webm" markdown="1">
</video>

- nastavíme viditelnost zvolených atributů u vrstvy "Parcely" (kmenové
  číslo, pododdělení čísla, výměra a druh pozemku)
  
Nejprve v QGISu nastavíme u zvolených atributů aliasy (`Attributes Form` ve vlastnostech vrstvy).

![](../assets/cviceni10/qgis_field_alias.png "QGIS: nastavení aliasů")

Změny v QGIS projektu uložíme. V nastavení Gisquick projektu provedeme aktualizaci.

<video controls="true" allowfullscreen="true" width=99%>
<source src="../../assets/cviceni10/gisquick_update.webm" type="video/webm" markdown="1">
</video>

Viditelnost atributů nastavíme z záložce `Layers`.

<video controls="true" allowfullscreen="true" width=99%>
<source src="../../assets/cviceni10/gisquick_field_visibility.webm" type="video/webm" markdown="1">
</video>

Po uložení změn (`Save`) znovu načteme mapovou aplikaci.

![](../assets/cviceni10/gisquick_field_alias.png "Gisquick: nastavení aliasů")

Po uložení změn se mezi podkladovými vrstvami jednoduše přepínat.

![](../assets/cviceni10/gisquick_base_layers_switch.png "Gisquick: přepínaní mezi podkladovými vrstvami")

!!! task-fg-color "Úkol"

    Podkladovou vrstvu je možné mít zapnutou pouze jednu. Nelze tedy kombinovat základní topografickou mapu a stínovaný reliéf. Tyto vrstvy lze přesunou zpátky do "Overlays". To bude ale vyžadovat nejprve vrstvy v QGISu přesunout mimo skupinu "WMS" a poté změnit nastavení Gisquick záložce `Layers`. Výsledek může vypadat následovně:
    
    ![](../assets/cviceni10/gisquick_map_app_hillshade.png "Gisquick: zobrazení mapové aplikace")

Ukázkovou mapovou aplikaci najdete na adrese <http://geo102.fsv.cvut.cz:8083/?PROJECT=gis1/cv10>
