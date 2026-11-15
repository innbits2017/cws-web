
using Cws.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cws.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OrdersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/orders
    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .OrderBy(o => o.BatchId)
            .ThenBy(o => o.SequenceNo)
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/orders/{orderId}
    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrder(string orderId)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
        {
            return NotFound(new
            {
                message = $"Order '{orderId}' was not found."
            });
        }

        return Ok(order);
    }

    // GET: api/orders/batch/{batchId}
    [HttpGet("batch/{batchId}")]
    public async Task<IActionResult> GetOrdersByBatch(string batchId)
    {
        var batchExists = await _context.Batches
            .AnyAsync(b => b.BatchId == batchId);

        if (!batchExists)
        {
            return NotFound(new
            {
                message = $"Batch '{batchId}' was not found."
            });
        }

        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.BatchId == batchId)
            .OrderBy(o => o.SequenceNo)
            .ToListAsync();

        return Ok(orders);
    }
}
