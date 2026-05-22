function hasPermissions(member, perms = []) {
  return perms.every(p => member.permissions.has(p));
}

function isHigherRole(member, target) {
  return member.roles.highest.comparePositionTo(target.roles.highest) > 0;
}

module.exports = { hasPermissions, isHigherRole };
