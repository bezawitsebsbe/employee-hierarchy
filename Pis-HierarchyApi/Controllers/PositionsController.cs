using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrgHierarchyApi.Data;
using OrgHierarchyApi.Models;

namespace OrgHierarchyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PositionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PositionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var positions = await _db.Positions.ToListAsync();
        return Ok(positions);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var positions = await _db.Positions.ToListAsync();

        var totalPositions = positions.Count;

        // Assume CEO is the single root (no ParentId), departments are its direct children
        var rootIds = positions
            .Where(p => p.ParentId == null)
            .Select(p => p.Id)
            .ToList();

        var departmentsCount = positions
            .Where(p => p.ParentId != null && rootIds.Contains(p.ParentId.Value))
            .Count();

        return Ok(new
        {
            totalPositions,
            departmentsCount
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var position = await _db.Positions.FindAsync(id);
        if (position == null) return NotFound();
        return Ok(position);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Position position)
    {
        if (position.ParentId.HasValue && !await _db.Positions.AnyAsync(p => p.Id == position.ParentId))
        {
            return BadRequest("Invalid ParentId");
        }

        _db.Positions.Add(position);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = position.Id }, position);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Position updated)
    {
        var position = await _db.Positions.FindAsync(id);
        if (position == null) return NotFound();

        position.Name = updated.Name;
        position.Description = updated.Description;
        position.ParentId = updated.ParentId;

        await _db.SaveChangesAsync();
        return Ok(position);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var position = await _db.Positions.FindAsync(id);
        if (position == null) return NotFound();

        var children = await _db.Positions.Where(p => p.ParentId == id).ToListAsync();
        foreach (var child in children) child.ParentId = null;

        _db.Positions.Remove(position);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}