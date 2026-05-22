using Microsoft.AspNetCore.Mvc;
using OrgHierarchyApi.Services;

namespace OrgHierarchyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRequest req)
    {
        try
        {
            var token = await _authService.Register(req.Email, req.Password);
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AuthRequest req)
    {
        try
        {
            var token = await _authService.Login(req.Email, req.Password);
            return Ok(new { Token = token });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class AuthRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}