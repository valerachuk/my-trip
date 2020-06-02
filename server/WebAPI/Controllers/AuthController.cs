using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTO;
using WebAPI.DTO.Auth;
using WebAPI.Extension;
using WebAPI.Services;

namespace WebAPI.Controllers
{
  [Authorize]
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : Controller
  {
    private readonly UserService _userService;
    private readonly AuthService _authService;
    private readonly GoogleOauthService _googleOauthService;

    public AuthController(UserService userService, AuthService authService, GoogleOauthService googleOauthService)
    {
      _userService = userService;
      _authService = authService;
      _googleOauthService = googleOauthService;
    }

    [AllowAnonymous]
    [HttpPost]
    public IActionResult Auth(AuthRequest authRequest)
    {
      var user = _userService.GetUser(authRequest.Email, authRequest.Password);
      if (user == null)
        return Unauthorized();

      var token = _authService.MakeToken(user);
      return Ok(new AuthResponse { AccessToken = token });
    }

    [AllowAnonymous]
    [HttpPost("google")]
    public async Task<IActionResult> AuthWithGoogle(GoogleOauthDTO gAuth) // I can transfer access code with path variable (google/{id})
    {
      string googleBearer = await _googleOauthService.GetToken(gAuth.Code);
      string email = await _googleOauthService.GetEmail(googleBearer);
      
      var user = _userService.GetUser(email);
      if (email == null || user != null && !user.IsOauth)
      {
        return Unauthorized();
      }

      if (user == null)
      {
        _userService.CreateOauthUser(email);
        user = _userService.GetUser(email);
      }

      var token = _authService.MakeToken(user);
      return Ok(new AuthResponse { AccessToken = token });
    }

    [HttpGet]
    public IActionResult getTest()
    {
      var id = HttpContext.GetUserIdFromClaim();
      return Ok($"Your id: {id}");
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("SignUp")]
    public IActionResult Registration(AuthRequest authRequest)
    {
      if (_userService.IsUserExist(authRequest.Email))
      {
        return UnprocessableEntity();
      }
      else
      {
        _userService.CreateUser(authRequest.Email, authRequest.Password);
        return Ok();
      }
    }
  }
}