const tokens = ['abracadabra', 'a99b44v568zzz']

function authorizedToken(token) {
  return tokens.includes(token)
}

exports.authorizedToken = authorizedToken
