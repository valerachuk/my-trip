﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Extension;
using WebAPI.Services;
using WebAPI.Services.Assets;

namespace WebAPI.Controllers
{
  [Authorize]
  [Route("api/[controller]")]
  [ApiController]
  public class WaypointFileController : ControllerBase
  {

    private readonly WaypointFileService _waypointFileService;
    private readonly WaypointService _waypointService;

    public WaypointFileController(WaypointFileService waypointFileFileService, WaypointService waypointService)
    {
      _waypointFileService = waypointFileFileService;
      _waypointService = waypointService;
    }

    [HttpPost]
    [Route("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile(int id, [FromForm] IFormFile file)
    {
      if (!_waypointService.IsWaypointAllowed(HttpContext.GetUserIdFromClaim(), id))
        return Forbid();

      if (file == null || file.Length < 0)
        return BadRequest("fileIsEmpty");

      if (file.Length > Consts.MaxWaypointFileSize)
        return BadRequest("fileIsToBig");

      if (!_waypointFileService.HasFreeSpace(id))
        return BadRequest("NoSpaceAvailable");

      return Ok(await _waypointFileService.AddFile(id, file));
    }

    [HttpDelete]
    [Route("{id}/{actualName}")]
    public IActionResult DeleteFile(string actualName, int id)
    {
      if (!_waypointService.IsWaypointAllowed(HttpContext.GetUserIdFromClaim(), id))
        return Forbid();

      _waypointFileService.DeleteFile(actualName);
      return Ok();
    }

  }
}
