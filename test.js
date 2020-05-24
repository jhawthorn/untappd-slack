const formatMessage = require("./format").formatMessage;

test("can format message", function() {
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