using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using OrgHierarchyApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OrgHierarchyApi.Services;

public class AuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _config;

    public AuthService(UserManager<AppUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    public async Task<string> Register(string email, string password)
    {
        var user = new AppUser { UserName = email, Email = email };
        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
        return await GenerateToken(user);
    }

    public async Task<string> Login(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, password))
        {
            throw new Exception("Invalid login");
        }
        return await GenerateToken(user);
    }

    private async Task<string> GenerateToken(AppUser user)
    {
        var claims = new List<Claim> { new Claim(ClaimTypes.Email, user.Email!) };
        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}