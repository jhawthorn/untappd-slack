
const sillyActions = [
    "allegedly consumed a",
    "has been spotted drinking",
    "gargled some",
    "under laboratory conditions drank a",
    "had some drinky. Specifically,",
    "believes all problems can be solved by",
    "cleansed their palette with",
    "drank through a krazy straw a",
];

const badActions = [
    "managed to finish a",
    "reluctantly tried a",
    "kept down a",
    "shouldn't have had a",
    "regretted having a",
    "was revolted by a",
    "hates"
];

const normalActions = [
    "drank a",
    "had a",
    "slammed a",
    "downed a",
    "imbibed a",
    "hammed a",
    "slurped a",
    "consumed a",
    "gulped a",
    "quaffed a",
    "sampled a"
];

const goodActions = [
    "thoroughly enjoyed a",
    "quenched their thirst with a",
    "drowned themselves in",
    "loves"
];

const availableActionNames = (rating) => {
    if (Math.random() < 0.10) {
        // silly
        return sillyActions;
    } else if (rating && rating <= 2.0) {
        // bad
        return badActions;
    } else if (!rating || rating <= 4.0) {
        // normal
        return normalActions;
    } else {
        // good
        return goodActions;
    }
};

const actionNameFor = (rating) => {
    const possible = availableActionNames(rating)
    return possible[Math.floor(Math.random() * possible.length)]
}

module.exports.formatMessage = (checkin, withName = true) => {
    const beer_name = checkin.beer.beer_name
    const brewery_name = checkin.brewery.brewery_name
    const rating_score = checkin.rating_score
    const rating_phrase = rating_score > 0 ? `and rated it *${rating_score}/5*` : ""
    const venue = checkin.venue.venue_name ? `at ${checkin.venue.venue_name}` : ""

    if (withName) {
        const user_name = `${checkin.user.first_name} ${checkin.user.last_name.charAt(0)}`
        const action = actionNameFor(rating_score)
        return `:beer: *${user_name}* ${action} *${beer_name}* from _${brewery_name}_ ${[rating_phrase, venue].filter(e => e).join(" ")}`
    } else {
        return `:beer: *${beer_name}* from _${brewery_name}_ ${[rating_phrase, venue].filter(e => e).join(" ")}`
    }
}
