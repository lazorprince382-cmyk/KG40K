$ErrorActionPreference = 'Stop'
$ruleName = 'Kasangati G40 Local Web (TCP 3000)'
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Set-NetFirewallRule -DisplayName $ruleName -Enabled True -Direction Inbound -Action Allow -Profile Private,Public | Out-Null
  Get-NetFirewallAddressFilter -AssociatedNetFirewallRule $existing |
    Set-NetFirewallAddressFilter -RemoteAddress LocalSubnet | Out-Null
} else {
  New-NetFirewallRule -DisplayName $ruleName `
    -Description 'Allow Kasangati G40 Node web application from devices on the same local network only.' `
    -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 `
    -RemoteAddress LocalSubnet -Profile Private,Public | Out-Null
}
