const formatMessage = require("./format").formatMessage;

test("can format message with name", function() {
	const payload = {
		beer: { beer_name: "Duff Beer" },
		user: {first_name: "Duff", last_name: "Man"},
		brewery: { brewery_name: "Duff Brewery" },
		venue: { venue_name: "Moe's Tavern" }
	}

	/* Results random, so let's test 100 times */
	for (let i = 0; i < 100; i++) {
	  expect(formatMessage(payload)).toMatch(/:beer: \*Duff M\* (.+) \*Duff Beer\* from _Duff Brewery_ at Moe's Tavern/);
	}
});

test("can format message with name and rating", function() {
	const payload = {
		beer: { beer_name: "Duff Beer" },
		user: {first_name: "Duff", last_name: "Man"},
		brewery: { brewery_name: "Duff Brewery" },
		venue: { venue_name: "Moe's Tavern" },
		rating_score: 3.5
	}

	/* Results random, so let's test 100 times */
	for (let i = 0; i < 100; i++) {
	  expect(formatMessage(payload)).toMatch(/:beer: \*Duff M\* (.+) \*Duff Beer\* from _Duff Brewery_ and rated it \*3\.5\/5\* at Moe's Tavern/);
	}
});

test("can format message", function() {
	const payload = {
		beer: { beer_name: "Duff Beer" },
		user: {first_name: "Duff", last_name: "Man"},
		brewery: { brewery_name: "Duff Brewery" },
		venue: { venue_name: "Moe's Tavern" }
	}

	/* Results random, so let's test 100 times */
	for (let i = 0; i < 100; i++) {
	  expect(formatMessage(payload, false)).toMatch(/:beer: \*Duff Beer\* from _Duff Brewery_ at Moe's Tavern/);
	}
});

test("can format message with rating", function() {
	const payload = {
		beer: { beer_name: "Duff Beer" },
		user: {first_name: "Duff", last_name: "Man"},
		brewery: { brewery_name: "Duff Brewery" },
		venue: { venue_name: "Moe's Tavern" },
		rating_score: 3.5
	}

	/* Results random, so let's test 100 times */
	for (let i = 0; i < 100; i++) {
	  expect(formatMessage(payload, false)).toMatch(/:beer: \*Duff Beer\* from _Duff Brewery_ and rated it \*3\.5\/5\* at Moe's Tavern/);
	}
});