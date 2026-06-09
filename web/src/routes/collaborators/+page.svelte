<script lang="ts">
	import { assetUrl } from "$lib/cms/assets";
	import SeoHead from "$lib/components/SeoHead.svelte";
	import Section from "$lib/components/Section.svelte";
	import DottedArrow from "$lib/components/DottedArrow.svelte";
	import DottedArrowHover from "$lib/components/DottedArrowHover.svelte";
</script>

<SeoHead 
	title="Clients & Collaborators" 
	description="RSM Design collaborates with a wide range of design and development partners resulting in hundreds of successful and well-known brands for cities, communities, large mixed-use projects, retail developments, hotels, restaurants, businesses and unique products."
/>

<template>
	<div class="container clients">
		<figure>
			<img src="/img/clients/CollaboratorSlider-C.jpg" alt="Pavilion with a manmade lake surrounded by native grass landscaping, custom sculptural concrete benches, and colorful industrial beam lampposts." />
		</figure>
		<section class="rich-text">
			<h1 class="xxxl">Clients & Collaborators.</h1>
			<p>RSM Design communicates the authenticity of a project’s unique message in a way that adds meaning and brings value to the team’s purpose. RSM Design has developed hundreds of successful and well-known brands for cities, communities, large mixed-use projects, retail developments, hotels, restaurants, businesses and unique products.</p>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Corporate & Workplace</h3>

			<ul>
				<li>Alexandria Real Estate</li>
				<li>Avila Group</li>
				<li>Billingsley Company</li>
				<li>Birtcher Anderson</li>
				<li>Chemonics International</li>
				<li>Cousins Properties</li>
				<li>Crow Family Holdings</li>
				<li>Hillwood</li>
				<li>Hines</li>
				<li>Irvine Company</li>
				<li>Ivanhóe Cambridge</li>
				<li>JM Family Enterprises</li>
				<li>Kilroy Realty Corporation</li>
				<li>Pizza Hut / Yum International</li>
				<li>Rosewood Property Company</li>
				<li>State Farm Insurance</li>
				<li>Stream Realty Partners</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Retail & Entertainment</h3>

			<ul>
				<li>Aldar Properties</li>
				<li>Ashkenazy Acquisitions</li>
				<li>Ayala Land</li>
				<li>Bayer Properties</li>
				<li>Blue Star Development</li>
				<li>Brookfield Properties</li>
				<li>Bucksbaum Properties</li>
				<li>Burke Williams</li>
				<li>Burnham Ward Properties</li>
				<li>Butler Enterprises</li>
				<li>Caruso Affiliated</li>
				<li>Cebu Holdings</li>
				<li>Centennial Real Estate</li>
				<li>CenterCal Properties</li>
				<li>Centergy Retail</li>
				<li>CBL Properties</li>
				<li>CIM Group</li>
				<li>The Cordish Companies</li>
				<li>Cuestamoras</li>
				<li>Dacra Development</li>
				<li>Dallas Cowboys</li>
				<li>Developers Diversified Realty</li>
				<li>DJM Capital Partners</li>
				<li>DLC Management</li>
				<li>Emaar Development</li>
				<li>Equinox Development</li>
				<li>Equity One</li>
				<li>Fancher Partners</li>
				<li>The Festival Companies</li>
				<li>The Food Hall Co.</li>
				<li>Forest City Development</li>
				<li>Front Burner Restaurants</li>
				<li>Frontier Real Estate Investments</li>
				<li>General Growth Properties</li>
				<li>Grupo Aldesa</li>
				<li>Grupo Deinsa</li>
				<li>Grupo HPB</li>
				<li>Grupo Roble</li>
				<li>Howard Group</li>
				<li>Hunt Development Group</li>
				<li>IKEA</li>
				<li>Inmobiliaria Americana</li>
				<li>InRetail Peru</li>
				<li>Irvine Company</li>
				<li>Kardan Land China</li>
				<li>Kemper Development Company</li>
				<li>Landmark Theatres</li>
				<li>L Catterton Real Estate</li>
				<li>LAB Holding</li>
				<li>Lady Lee</li>
				<li>Lance-Kashian & Company</li>
				<li>Lincoln Property Company</li>
				<li>MAB Development Nederland</li>
				<li>Macerich</li>
				<li>Madison Marquette</li>
				<li>Majid Al Futtaim Group</li>
				<li>Metrocentro</li>
				<li>Mills Corporation</li>
				<li>National Geographic Encounter</li>
				<li>Nike</li>
				<li>O’Connor Capital Partners</li>
				<li>OCT Urban Entertainment Investment Co.</li>
				<li>OliverMcMillan</li>
				<li>The Oriental Land Company</li>
				<li>Poag & McEwen</li>
				<li>Portafolio Inmobiliario</li>
				<li>Presidio Bay Ventures</li>
				<li>Ram Realty Services</li>
				<li>Regency Centers</li>
				<li>The Related Group</li>
				<li>Seritage Growth Properties</li>
				<li>Shapell Liberty Investment Properties</li>
				<li>Shea Properties</li>
				<li>Simon Property Group</li>
				<li>SITE Centers</li>
				<li>Sonae Sierra</li>
				<li>Spinosa Real Estate Group</li>
				<li>Starwood Retail Partners</li>
				<li>Steiner + Associates</li>
				<li>SZITIC Commercial Property</li>
				<li>Taubman</li>
				<li>Trademark Property</li>
				<li>Triple Five</li>
				<li>Unibail-Rodamco-Westfield</li>
				<li>Unicorp National Developments</li>
				<li>Valcor Commercial Real Estate</li>
				<li>Vestar</li>
				<li>Walt Disney Imagineering</li>
				<li>Weingarten Realty</li>
				<li>Westrust Ventures</li>
				<li>WS Development</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Hospitality</h3>

			<ul>
				<li>AC Hotels by Marriott</li>
				<li>Aman Resorts</li>
				<li>Andaz Hotels by Hyatt</li>
				<li>BRE Hotels & Resorts</li>
				<li>Caesars Palace Entertainment</li>
				<li>Capella Hotel Group</li>
				<li>Fairmont Hotels & Resorts</li>
				<li>Harwood International</li>
				<li>Hilton Hotels & Resorts</li>
				<li>Hotel ZaZa</li>
				<li>Hyatt Corporation</li>
				<li>Intercontinental Hotels</li>
				<li>Jackson Hole Mountain Resort</li>
				<li>Kerzner International</li>
				<li>Lotusland Investment Group</li>
				<li>Omni Hotels & Resorts</li>
				<li>One & Only Resorts</li>
				<li>Outrigger Hotels & Resorts</li>
				<li>Pechanga Resort Casino</li>
				<li>Pellas Development</li>
				<li>Ritz Carlton Resorts</li>
				<li>Royal Caribbean Cruises</li>
				<li>Sands Resorts & Casinos</li>
				<li>San Manuel Hotel & Casino</li>
				<li>Solis Hotels</li>
				<li>St. Regis Hotels</li>
				<li>Sunvesta</li>
				<li>Tavistock Hotel Collection</li>
				<li>The Venetian Resort Hotel Casino</li>
				<li>Viceroy Hotels & Resorts</li>
				<li>Virgin Hotels</li>
				<li>Walt Disney Hospitality</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Arts & Culture</h3>

			<ul>
				<li>American Institute of Architects</li>
				<li>The Architecture & Design Exchange</li>
				<li>Balboa Park Conservancy</li>
				<li>Ballet Lubbock</li>
				<li>Boy Scouts of America</li>
				<li>Buddy Holly Performing Arts</li>
				<li>Casa Romantica</li>
				<li>Crow Collection of Asian Arts</li>
				<li>Dallas Holocaust and Human Rights Museum</li>
				<li>El Paso Children’s Museum</li>
				<li>Festival of Arts Pageant of the Masters</li>
				<li>Fort Worth Stockyards National Historic District</li>
				<li>Laguna Playhouse</li>
				<li>Jewish Federation of Greater Los Angeles</li>
				<li>Museo Miraflores</li>
				<li>National Trust for Historic Preservation</li>
				<li>NoMa Business Improvement District</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Healthcare</h3>

			<ul>
				<li>Baylor Scott & White</li>
				<li>Dugoni School of Dentistry</li>
				<li>Kaiser Permanente</li>
				<li>The Legacy Midtown Park</li>
				<li>Memorial Hermann Health System</li>
				<li>Parkland Memorial Hospital</li>
				<li>St. Joseph Healthcare</li>
				<li>Texas Medical Center</li>
				<li>University of Pacific Dental Clinic</li>
				<li>University of Pacific Hearing / Balance Center</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Education</h3>

			<ul>
				<li>The Brentwood School</li>
				<li>College of the Desert</li>
				<li>East Los Angeles Community College</li>
				<li>The Episcopal School of Dallas</li>
				<li>Fresno State University</li>
				<li>Glendale Community College</li>
				<li>Harbor Day School</li>
				<li>New York University</li>
				<li>San Diego State University</li>
				<li>Santa Ana College</li>
				<li>University of California, Davis</li>
				<li>University of California, Irvine</li>
				<li>University of California, Los Angeles</li>
				<li>University of California, Riverside</li>
				<li>University of California, San Diego</li>
				<li>The University of Chicago</li>
				<li>University of the Pacific</li>
				<li>University of Southern California</li>
				<li>The University of Texas at Dallas</li>
				<li>University of Washington, Seattle</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Architecture & Landscape</h3>

			<ul>
				<li>5+ Design</li>
				<li>5G Studio Collaborative</li>
				<li>AECOM</li>
				<li>AHL</li>
				<li>Altoon Partners</li>
				<li>Archasia Design Group</li>
				<li>Architects Orange</li>
				<li>Arquitectonica</li>
				<li>BAR Architects</li>
				<li>BCV Architects</li>
				<li>Beame Architectural Partnership</li>
				<li>Beyer Blinder Belle</li>
				<li>Belzberg Architects</li>
				<li>Bennett Benner Partners</li>
				<li>Bennitt Design Group</li>
				<li>Benoy</li>
				<li>Bergman Walls & Associates</li>
				<li>Bergmann Associates</li>
				<li>Bermello Ajamil & Partners</li>
				<li>Bickel Group Architecture</li>
				<li>BNIM</li>
				<li>BOKA Powell</li>
				<li>Bjarke Ingels Group (BIG)</li>
				<li>Brightview Design Group</li>
				<li>Burton</li>
				<li>C2 Collaborative</li>
				<li>CallisonRTKL (CRTKL)</li>
				<li>CannonDesign</li>
				<li>Carroll Associates</li>
				<li>Chapman Taylor</li>
				<li>Civil Site Design Group</li>
				<li>CLB Architects</li>
				<li>Cooper Carry</li>
				<li>Corgan</li>
				<li>D2 Architects</li>
				<li>Design Collective</li>
				<li>Design Partners Inc.</li>
				<li>Design Workshop</li>
				<li>dwg.</li>
				<li>Diamond Schmitt Architects</li>
				<li>Diller Scofidio + Renfro</li>
				<li>DLR Group</li>
				<li>Donohue Schriber Realty Group</li>
				<li>EDAW</li>
				<li>Elkus Manfredi Architects</li>
				<li>ELS Architects</li>
				<li>Entos Design</li>
				<li>EPT Design</li>
				<li>Field Paoli Architects</li>
				<li>FRCH Nelson</li>
				<li>Friedmutter Group</li>
				<li>GBD Architects</li>
				<li>Gensler</li>
				<li>GFF</li>
				<li>GH+A Design</li>
				<li>Gresham Smith</li>
				<li>Group 70 International</li>
				<li>GSB</li>
				<li>Harwood Design Factory</li>
				<li>HED</li>
				<li>HDR</li>
				<li>HLM Architects</li>
				<li>HKS</li>
				<li>Hobbs + Black Architects</li>
				<li>Homes & Narver</li>
				<li>HOK</li>
				<li>House & Robertson Architects</li>
				<li>Houston / Tyner</li>
				<li>HPP Architekten</li>
				<li>IwamotoScott Architecture</li>
				<li>Jerde</li>
				<li>John Bates Associates</li>
				<li>Johnson Fain</li>
				<li>JP2 Architects</li>
				<li>KA Architecture</li>
				<li>Keisker & Wiggle Architects</li>
				<li>KMA Architecture</li>
				<li>KSH Architects</li>
				<li>Kritzinger + Rao</li>
				<li>Laguarda.Low</li>
				<li>Lake Flato Architects</li>
				<li>Lifescapes International</li>
				<li>Lopes Dias Arquitetura</li>
				<li>LPA</li>
				<li>LRM</li>
				<li>M+A Architects</li>
				<li>Malone Maxwell Dennehy Architects</li>
				<li>Martha Schwartz Partners</li>
				<li>MBH Architects</li>
				<li>MCG Architecture</li>
				<li>MDR Architects</li>
				<li>MESA Design Group</li>
				<li>MG2</li>
				<li>MGMA</li>
				<li>Mikyoung Kim Design</li>
				<li>Mithun</li>
				<li>MSTSD</li>
				<li>The Mulhern Group</li>
				<li>MVE + Partners</li>
				<li>NBBJ</li>
				<li>Nelsen Partners</li>
				<li>NELSON Worldwide</li>
				<li>Nelson Byrd Woltz</li>
				<li>NG+P</li>
				<li>Nikken Sekkei</li>
				<li>Nudell Architects</li>
				<li>O’Brien Architects</li>
				<li>ONeil Langan Architects</li>
				<li>Odell</li>
				<li>Oglesby Greene Architecture</li>
				<li>OJB</li>
				<li>OKW Architects</li>
				<li>OLIN</li>
				<li>Olson Kundig Architects</li>
				<li>OMA</li>
				<li>OMNIPLAN</li>
				<li>Oppenheim Architecture</li>
				<li>Overland Partners</li>
				<li>Parkhill, Smith & Cooper</li>
				<li>Paul Duesing Partners</li>
				<li>PDT International</li>
				<li>Perkins + Will</li>
				<li>Perlman Architects</li>
				<li>Pitassi Architects</li>
				<li>RATIO</li>
				<li>RDC</li>
				<li>REES</li>
				<li>RIOS</li>
				<li>RMTA</li>
				<li>RNT Architects</li>
				<li>Safdie Rabines Architects</li>
				<li>Sasaki</li>
				<li>Savino & Miller Design Studio</li>
				<li>SB Architects</li>
				<li>Shook Kelley</li>
				<li>Skidmore, Ownings & Merrill (SOM)</li>
				<li>Smith Group</li>
				<li>SMS Architects</li>
				<li>Snøhetta</li>
				<li>STIR Architecture</li>
				<li>Streetsense</li>
				<li>Studio-MLA</li>
				<li>Studio One Eleven</li>
				<li>Studio Outside</li>
				<li>Surface Design</li>
				<li>SWA Group</li>
				<li>TBG Partners</li>
				<li>tBP/Architecture</li>
				<li>Ten Eyck Landscape</li>
				<li>Thomas Sabin Studio</li>
				<li>TimHaahs</li>
				<li>TSArchitects</li>
				<li>TSK Architects</li>
				<li>TVS Design</li>
				<li>TWLA</li>
				<li>Wakefield Beasley & Associates</li>
				<li>WATG</li>
				<li>Westberg White Architecture</li>
				<li>William Hezmalhalch Architects</li>
				<li>Wilson Associates</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Institutional & Civic</h3>

			<ul>
				<li>Butte County</li>
				<li>City of Alton, IL</li>
				<li>City of Antioch, CA</li>
				<li>City of Aspen, CO</li>
				<li>City of Beverly Hills, CA</li>
				<li>City of Dallas, TX</li>
				<li>City of Dana Point, CA</li>
				<li>City of Fort Worth, TX</li>
				<li>City of Honolulu, HI</li>
				<li>City of Huntington Beach, CA</li>
				<li>City of Indian Wells, CA</li>
				<li>City of Irvine, CA</li>
				<li>City of Laguna Hills, CA</li>
				<li>City of Las Vegas, NV</li>
				<li>City of Los Angeles, CA</li>
				<li>City of Menifee, CA</li>
				<li>City of Miami, FL</li>
				<li>City of Newport Beach, CA</li>
				<li>City of Palm Desert, CA</li>
				<li>City of Paramount, CA</li>
				<li>City of Rancho Cucamonga, CA</li>
				<li>City of Rowlett, TX</li>
				<li>City of Sacramento, CA</li>
				<li>City of San Clemente, CA</li>
				<li>City of San Diego, CA</li>
				<li>City of Southlake, TX</li>
				<li>City of Temecula, CA</li>
				<li>City of Tustin, CA</li>
				<li>City of Westlake, TX</li>
				<li>Civic San Diego</li>
				<li>County of Los Angeles</li>
				<li>Dallas County</li>
				<li>GMR</li>
				<li>Kamehameha School District</li>
				<li>Lili’uokalani Trust</li>
				<li>Los Angeles Metro</li>
				<li>Miami Downtown Development Authority</li>
				<li>The Village of Bolingbrook, IL</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Residential & Multi-family</h3>

			<ul>
				<li>Brookfield Residential</li>
				<li>Capital Pacific Holdings</li>
				<li>Chateau Group USA</li>
				<li>Chelsea Investment Corporation</li>
				<li>City Ventures</li>
				<li>The Corky McMillin Companies</li>
				<li>Crescent Communities</li>
				<li>Daybreak Communities</li>
				<li>Eagle Hills</li>
				<li>Elliott Homes</li>
				<li>Emaar MISR</li>
				<li>Five Point Communities</li>
				<li>Foremost Companies</li>
				<li>Forestar Group</li>
				<li>Haseko Hawaii</li>
				<li>Hillwood Communities</li>
				<li>Hines</li>
				<li>Irvine Company</li>
				<li>Lakeside Capital Group</li>
				<li>Lennar</li>
				<li>Lewis Group of Companies</li>
				<li>Lowe Property Group</li>
				<li>Makar Properties</li>
				<li>Mattamy Homes</li>
				<li>Minto Communities</li>
				<li>The New Home Company</li>
				<li>Newhall Land Development</li>
				<li>Newland Communities</li>
				<li>Nshama</li>
				<li>Oakpointe Communities</li>
				<li>Post Properties</li>
				<li>Raintree Partners</li>
				<li>San Geronimo Development Group</li>
				<li>Shapell Properties</li>
				<li>Sotheby’s International Realty</li>
				<li>Stonelake Capital Partners</li>
				<li>Tavistock</li>
				<li>Terra Development</li>
				<li>Trammell Crow Residential Company</li>
			</ul>
		</section>
		<section class="collaborators-list">
			<h3 class="xxl">Real Estate & Infrastructure</h3>

			<ul>
				<li>American Airlines</li>
				<li>Berkshire Hathaway</li>
				<li>Berman Enterprises</li>
				<li>Blanton Turner</li>
				<li>Boeing Realty Corporation</li>
				<li>British Petroleum</li>
				<li>Brixton Capital</li>
				<li>Callahan Capital Management</li>
				<li>Cadillac Fairview</li>
				<li>Capital Resource Management</li>
				<li>Carter & Burgess</li>
				<li>Cassco Land Company</li>
				<li>CBRE</li>
				<li>Central Pattana</li>
				<li>Chemonics International</li>
				<li>CM&D</li>
				<li>Crosland</li>
				<li>Cushman & Wakefield</li>
				<li>Dasher & Tabata</li>
				<li>Davis Street Land Company</li>
				<li>DeBartolo Development</li>
				<li>Desarrollos Chac-Mool</li>
				<li>Desarrollos Inmobiliarios</li>
				<li>Delhi International Airport Limited</li>
				<li>EB Arrow</li>
				<li>Equinox Development</li>
				<li>Emaar Properties</li>
				<li>Emsas Construction</li>
				<li>Endeavor Real Estate Group</li>
				<li>Federal Realty Investment Trust</li>
				<li>Fenix Development</li>
				<li>Freeman Group</li>
				<li>Garfield Public Private</li>
				<li>GBT Realty</li>
				<li>Gerrity Group</li>
				<li>Greenfield Development</li>
				<li>Greenlaw Partners</li>
				<li>Grupo Gicsa</li>
				<li>GSW Development</li>
				<li>H&S Ventures</li>
				<li>HDS Construction</li>
				<li>Heritage Development</li>
				<li>Hill Partners</li>
				<li>Howard Hughes Corporation</li>
				<li>IDS Real Estate Group</li>
				<li>Inter-Cal Real Estate</li>
				<li>iStar</li>
				<li>JBG Smith</li>
				<li>Jones Lang LaSalle (JLL)</li>
				<li>JTS Management</li>
				<li>KDC</li>
				<li>Kiewit Corporation</li>
				<li>Kimco Realty</li>
				<li>The Koll Company</li>
				<li>Konterra Realty</li>
				<li>The Krausz Companies</li>
				<li>Lockwood Development</li>
				<li>McAlister Development</li>
				<li>McCord Development</li>
				<li>Majestic Realty Co.</li>
				<li>Matter Real Estate Group</li>
				<li>Merlone Geier Management</li>
				<li>MetLife Investment Management</li>
				<li>MetroNational</li>
				<li>Metro-North Railroad (MNR)</li>
				<li>Metropolitan Transportation Authority of New York (MTA)</li>
				<li>Mitsui Fudosan</li>
				<li>New World Development</li>
				<li>North County Transit District</li>
				<li>North Rock Real Estate</li>
				<li>Nuquest Ventures</li>
				<li>The Opus Group</li>
				<li>Orion Pacific</li>
				<li>Pendulum Property Partners</li>
				<li>Port of San Diego</li>
				<li>Price Brothers</li>
				<li>Protea Properties</li>
				<li>Raintree Partners</li>
				<li>Republic Property Group</li>
				<li>Russell Glen</li>
				<li>Schnitzer West</li>
				<li>Sea Breeze Properties</li>
				<li>Shimizu Corporation</li>
				<li>Southwest Value Partners</li>
				<li>Spectrum Development Group</li>
				<li>Spire Realty</li>
				<li>Structured Development</li>
				<li>Sudberry Properties</li>
				<li>Swerdlow Group</li>
				<li>Swire Development</li>
				<li>Tavistock</li>
				<li>Thomas Enterprises</li>
				<li>Trammel Crow Company</li>
				<li>Trinity Works</li>
				<li>Urban Corps of San Diego County</li>
				<li>Walsin Development</li>
				<li>Wilson Meany</li>
				<li>Witkoff</li>
				<li>Woodbury Corporation</li>
			</ul>
		</section>
		<section class="cta">
			<DottedArrowHover href="/work">
				<h4 class="xxxl heading">Latest projects.</h4>
				<p>View Our Work <DottedArrow /></p>
			</DottedArrowHover>
		</section>
	</div>
</template>

<style lang="scss">
	section.rich-text {
		grid-column: third-start 1 / span 2 third-end;

		@media (max-width: 31.25em) {
			grid-column: span 1;
		}

		> h1 {
			margin-bottom: var(--GRID-CELL);
		}
	}
	section.collaborators-list {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 2);

		> h3 {
			margin-bottom: var(--GRID-CELL);
		}

		> ul {
			column-gap: calc(var(--GRID-CELL) * 0.5);
			columns: 4;

			@media (max-width: 62.5em) {
				columns: 3;
			}
		}
	}
	section.cta {
		grid-column: whole;
		margin-top: calc(var(--GRID-CELL) * 3);
	}
</style>